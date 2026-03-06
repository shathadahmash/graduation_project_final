# core/views/import_projects.py

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from django.db import transaction
import openpyxl

import re
import random
import string

from core.models import (
    User,
    Role,
    UserRoles,
    Project,
    ProjectState,
    Group,
    GroupSupervisors,
)

# ==========================================================
# Permission
# ==========================================================

def is_system_manager(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    if getattr(user, "is_superuser", False):
        return True
    return UserRoles.objects.filter(user=user, role__type__iexact="system manager").exists()


# ==========================================================
# Excel Header Mapping (Arabic → Internal Keys)
# ==========================================================

AR_HEADER_MAP = {
    "عنوان المشروع": "title",
    "نوع المشروع": "project_type",          # (ignored حاليا)
    "الحالة": "state",
    "الملخص": "abstract",
    "المشرف": "supervisor_name",            # name or email
    "المشرف المشارك": "co_supervisor_name", # name or email
    "الجامعة": "university_name_ar",        # (ignored حاليا)
    "الكلية": "college_name_ar",            # (ignored حاليا)
    "القسم": "department_name",             # (ignored حاليا)
    "سنة البداية": "start_year",
    "سنة النهاية": "end_year",
    "المجال": "field",
    "الأدوات": "tools",
    "أنشئ بواسطة": "created_by_name",       # optional - if provided must exist
}

REQUIRED_KEYS = [
    "title",
    "state",
    "abstract",
    "university_name_ar",
    "college_name_ar",
    "department_name",
    "start_year",
]

STATE_MAP = {
    "معلق": "Pending",
    "مقبول": "Accepted",
    "محجوز": "Reserved",
    "مكتمل": "Completed",
    "مرفوض": "Rejected",
}


# ==========================================================
# Helpers
# ==========================================================

def _str(v):
    return "" if v is None else str(v).strip()

def _normalize(v):
    return " ".join(_str(v).split())

def _to_int(v):
    if v is None or _str(v) == "":
        return None
    try:
        return int(float(_str(v)))  # handles 2025.0 from Excel
    except Exception:
        return None

def _slugify_username(name: str) -> str:
    s = _str(name).lower()
    s = re.sub(r"\s+", "_", s)
    s = re.sub(r"[^a-z0-9_]", "", s)
    return s or "user"

def _generate_unique_username(base: str) -> str:
    base = _slugify_username(base)[:20]
    while True:
        suffix = "".join(random.choices(string.digits, k=4))
        username = f"{base}_{suffix}"
        if not User.objects.filter(username__iexact=username).exists():
            return username

def _find_user_strict(raw):
    """
    Strict find: used for created_by_name (لا ننشئه تلقائياً).
    Returns: (user, err_msg)
    """
    val = _str(raw)
    if not val:
        return None, None

    # email
    if "@" in val:
        u = User.objects.filter(email__iexact=val).first()
        if not u:
            return None, f"لا يوجد مستخدم بهذا البريد: {val}"
        return u, None

    # name
    qs = User.objects.filter(name__iexact=val)
    cnt = qs.count()
    if cnt == 0:
        return None, f"لا يوجد مستخدم بهذا الاسم: {val}"
    if cnt > 1:
        return None, f"الاسم مكرر ({val}). استخدم البريد بدل الاسم."
    return qs.first(), None

def get_or_create_user_by_name_or_email(raw: str, role_type: str = None):
    """
    For supervisor/co-supervisor:
    - if exists -> return user
    - if not exists -> create user with auto username
    - if role_type provided -> ensure UserRoles exists
    """
    val = _str(raw)
    if not val:
        return None, None, False  # (user, err, created)

    created = False

    # 1) Email case
    if "@" in val:
        u = User.objects.filter(email__iexact=val).first()
        if not u:
            username = _generate_unique_username(val.split("@")[0])
            u = User.objects.create(
                username=username,
                email=val,
                name=val.split("@")[0],
                first_name="",
                last_name="",
            )
            u.set_password("password123")
            u.save()
            created = True

        # assign role if exists
        if role_type:
            role_obj = Role.objects.filter(type__iexact=role_type).first()
            if role_obj:
                UserRoles.objects.get_or_create(user=u, role=role_obj)
        return u, None, created

    # 2) Name case
    qs = User.objects.filter(name__iexact=val)
    cnt = qs.count()

    if cnt > 1:
        return None, f"الاسم مكرر ({val}). استخدم البريد بدل الاسم.", False

    if cnt == 1:
        u = qs.first()
    else:
        username = _generate_unique_username(val)
        u = User.objects.create(
            username=username,
            email="",
            name=val,
            first_name=val,  # optional
            last_name="",
        )
        u.set_password("password123")
        u.save()
        created = True

    if role_type:
        role_obj = Role.objects.filter(type__iexact=role_type).first()
        if role_obj:
            UserRoles.objects.get_or_create(user=u, role=role_obj)

    return u, None, created


# ==========================================================
# Excel Reading (Row 2 headers, Row 3+ data)
# ==========================================================

def read_excel_projects(file_obj):
    wb = openpyxl.load_workbook(file_obj, data_only=True)
    ws = wb.active

    headers = [_str(c.value) for c in ws[2]]
    index_map = {}

    for i, h in enumerate(headers):
        if h in AR_HEADER_MAP:
            index_map[AR_HEADER_MAP[h]] = i

    missing = [k for k in REQUIRED_KEYS if k not in index_map]
    if missing:
        # عرض المفاتيح المفقودة كـ internal keys (يكفي الآن)
        return None, [{
            "row": 2,
            "field": ",".join(missing),
            "message": "أعمدة مطلوبة غير موجودة",
            "value": None
        }]

    rows = []
    for r in range(3, ws.max_row + 1):
        values = [ws.cell(row=r, column=c).value for c in range(1, ws.max_column + 1)]
        if all(v is None or _str(v) == "" for v in values):
            continue

        row_data = {}
        for key, idx in index_map.items():
            row_data[key] = ws.cell(row=r, column=idx + 1).value

        rows.append((r, row_data))

    return rows, []


# ==========================================================
# Validation
# ==========================================================

def validate_rows(rows, request_user):
    errors = []
    valid = []

    for excel_row, row in rows:
        title = _normalize(row.get("title"))
        abstract = _str(row.get("abstract"))
        state_ar = _normalize(row.get("state"))
        uni_name = _normalize(row.get("university_name_ar"))
        college_name = _normalize(row.get("college_name_ar"))
        dept_name = _normalize(row.get("department_name"))
        start_year = _to_int(row.get("start_year"))
        end_year = _to_int(row.get("end_year"))
        field = _str(row.get("field"))
        tools = _str(row.get("tools"))

        supervisor_raw = _str(row.get("supervisor_name"))
        co_raw = _str(row.get("co_supervisor_name"))

        # created_by strict (if provided must exist)
        created_by_user = request_user
        cb_raw = _str(row.get("created_by_name"))
        if cb_raw:
            cb_user, cb_err = _find_user_strict(cb_raw)
            if cb_err:
                errors.append({"row": excel_row, "field": "أنشئ بواسطة", "message": cb_err, "value": cb_raw})
            else:
                created_by_user = cb_user

        # Required checks
        if not title:
            errors.append({"row": excel_row, "field": "عنوان المشروع", "message": "مطلوب", "value": row.get("title")})
        if not abstract:
            errors.append({"row": excel_row, "field": "الملخص", "message": "مطلوب", "value": row.get("abstract")})
        if not uni_name:
            errors.append({"row": excel_row, "field": "الجامعة", "message": "مطلوبة", "value": row.get("university_name_ar")})
        if not college_name:
            errors.append({"row": excel_row, "field": "الكلية", "message": "مطلوبة", "value": row.get("college_name_ar")})
        if not dept_name:
            errors.append({"row": excel_row, "field": "القسم", "message": "مطلوب", "value": row.get("department_name")})
        if not start_year:
            errors.append({"row": excel_row, "field": "سنة البداية", "message": "سنة صحيحة مطلوبة مثل 2025", "value": row.get("start_year")})

        # years sanity
        if start_year and (start_year < 1900 or start_year > 2100):
            errors.append({"row": excel_row, "field": "سنة البداية", "message": "سنة البداية خارج النطاق", "value": start_year})
        if end_year and (end_year < 1900 or end_year > 2100):
            errors.append({"row": excel_row, "field": "سنة النهاية", "message": "سنة النهاية خارج النطاق", "value": end_year})
        if start_year and end_year and end_year < start_year:
            errors.append({"row": excel_row, "field": "سنة النهاية", "message": "لا يمكن أن تكون أقل من سنة البداية", "value": end_year})

        # state
        if state_ar not in STATE_MAP:
            errors.append({
                "row": excel_row,
                "field": "الحالة",
                "message": f"قيمة غير مدعومة ({state_ar}) - المسموح: {', '.join(STATE_MAP.keys())}",
                "value": state_ar
            })

        # ✅ IMPORTANT CHANGE:
        # supervisor/co-supervisor are NOT validated as existing users anymore
        # we will create them in commit if not found

        if any(e["row"] == excel_row for e in errors):
            continue

        valid.append({
            "excel_row": excel_row,
            "title": title,
            "description": abstract,
            "state_en": STATE_MAP[state_ar],
            "university_name": uni_name,
            "college_name": college_name,
            "dept_name": dept_name,
            "start_year": start_year,
            "end_year": end_year,
            "field": field,
            "tools": tools,
            "created_by_id": created_by_user.id if created_by_user else request_user.id,

            # keep raw values to create users later
            "supervisor_raw": supervisor_raw,
            "co_raw": co_raw,
        })

    return valid, errors


# ==========================================================
# API: VALIDATE
# ==========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_projects_validate(request):
    if not is_system_manager(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    f = request.FILES.get("file")
    if not f:
        return Response({"detail": "No file uploaded"}, status=400)

    rows, file_errors = read_excel_projects(f)
    if file_errors:
        return Response({
            "total_rows": 0,
            "valid_rows": 0,
            "invalid_rows": len(file_errors),
            "errors": file_errors,
        }, status=400)

    valid, errors = validate_rows(rows, request.user)

    return Response({
        "total_rows": len(rows),
        "valid_rows": len(valid),
        "invalid_rows": len(errors),
        "errors": errors,
    })


# ==========================================================
# API: COMMIT
# ==========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_projects_commit(request):
    if not is_system_manager(request.user):
        return Response({"detail": "Forbidden"}, status=403)

    f = request.FILES.get("file")
    if not f:
        return Response({"detail": "No file uploaded"}, status=400)

    rows, file_errors = read_excel_projects(f)
    if file_errors:
        return Response({"errors": file_errors}, status=400)

    valid, errors = validate_rows(rows, request.user)
    if errors:
        return Response({
            "invalid_rows": len(errors),
            "errors": errors,
        }, status=400)

    created_projects = 0
    updated_projects = 0

    # extra counters (optional - helpful for you)
    created_supervisor_users = 0
    created_co_users = 0
    supervisors_linked = 0
    co_linked = 0

    with transaction.atomic():
        for item in valid:
            # Resolve project state
            state_obj, _ = ProjectState.objects.get_or_create(name=item["state_en"])

            # Find existing project (policy v1)
            existing = Project.objects.filter(
                title__iexact=item["title"],
                start_date=item["start_year"],
                created_by_id=item["created_by_id"]
            ).first()

            if existing:
                p = existing
                p.description = item["description"]
                p.state = state_obj
                p.end_date = item["end_year"]
                p.field = item["field"]
                p.tools = item["tools"]
                p.save()
                updated_projects += 1
            else:
                p = Project.objects.create(
                    title=item["title"],
                    description=item["description"],
                    state=state_obj,
                    start_date=item["start_year"],
                    end_date=item["end_year"],
                    field=item["field"],
                    tools=item["tools"],
                    created_by_id=item["created_by_id"],
                )
                created_projects += 1

            # Ensure group exists
            g = Group.objects.filter(project=p).first()
            if not g:
                g = Group.objects.create(
                    project=p,
                    academic_year=str(item["start_year"]) if item["start_year"] else None,
                    pattern=None
                )

            # ✅ Create/resolve supervisor users (names or emails)
            sup_user = None
            co_user = None

            if item.get("supervisor_raw"):
                sup_user, sup_err, sup_created = get_or_create_user_by_name_or_email(
                    item["supervisor_raw"],
                    role_type="supervisor"
                )
                if sup_err:
                    # name duplicated -> stop with clear error
                    return Response({
                        "invalid_rows": 1,
                        "errors": [{
                            "row": item["excel_row"],
                            "field": "المشرف",
                            "message": sup_err,
                            "value": item["supervisor_raw"]
                        }],
                    }, status=400)
                if sup_created:
                    created_supervisor_users += 1

            if item.get("co_raw"):
                co_user, co_err, co_created = get_or_create_user_by_name_or_email(
                    item["co_raw"],
                    role_type="Co-supervisor"
                )
                if co_err:
                    return Response({
                        "invalid_rows": 1,
                        "errors": [{
                            "row": item["excel_row"],
                            "field": "المشرف المشارك",
                            "message": co_err,
                            "value": item["co_raw"]
                        }],
                    }, status=400)
                if co_created:
                    created_co_users += 1

            # Link supervisors
            if sup_user:
                _, created = GroupSupervisors.objects.get_or_create(
                    group=g,
                    user=sup_user,
                    type="supervisor"
                )
                if created:
                    supervisors_linked += 1

            if co_user:
                _, created = GroupSupervisors.objects.get_or_create(
                    group=g,
                    user=co_user,
                    type="co_supervisor"
                )
                if created:
                    co_linked += 1

    return Response({
        "total_rows": len(rows),
        "valid_rows": len(valid),
        "invalid_rows": 0,
        "created_projects": created_projects,
        "updated_projects": updated_projects,

        # optional debug/info
        "created_supervisor_users": created_supervisor_users,
        "created_co_users": created_co_users,
        "supervisors_linked": supervisors_linked,
        "co_linked": co_linked,

        "message": "Projects import completed successfully."
    })