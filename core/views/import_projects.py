from io import BytesIO
import openpyxl
import re
from openpyxl import Workbook
from openpyxl.styles import Font

from django.db import transaction
from django.http import HttpResponse

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.views.decorators.csrf import csrf_exempt

from core.models import (
    User,
    Project,
    ProjectState,
    University,
    College,
    Department,
    City,
    Branch,
    Role,
    Staff,
)

# ==========================================================
# Header Mapping
# ==========================================================

AR_HEADER_MAP = {
    "عنوان المشروع": "title",
    "الملخص": "description",
    "الحالة": "state",
    "المشرف - National Number": "supervisor_cid",
    "المشرف - First Name": "supervisor_first_name",
    "المشرف - Last Name": "supervisor_last_name",
    "المشرف - Phone": "supervisor_phone",
    "المشرف - Email": "supervisor_email",
    "المشرف - Qualification": "supervisor_qualification",
    "المشرف - Gender": "supervisor_gender",
    "المشرف المشارك - National Number": "co_cid",
    "المشرف المشارك - First Name": "co_first_name",
    "المشرف المشارك - Last Name": "co_last_name",
    "المشرف المشارك - Phone": "co_phone",
    "المشرف المشارك - Email": "co_email",
    "المشرف المشارك - Qualification": "co_qualification",
    "المشرف المشارك - Gender": "co_gender",
    "سنة البداية": "start_year",
    "سنة النهاية": "end_year",
    "المجال": "field",
    "الأدوات": "tools",
    "Logo Path": "Logo",
    "الجامعة": "university",
    "الكلية": "college",
    "القسم": "department",
    "Documentation Path": "Documentation_Path",
    "الطلاب": "students",
}

REQUIRED_KEYS = [
    "title",
    "description",
    "start_year",
    "university",
    "college",
    "department",
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
        return int(float(_str(v)))
    except:
        return None


# ==========================================================
# Excel Reader
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
        return None, [{
            "row": 2,
            "field": ",".join(missing),
            "message": "أعمدة مطلوبة غير موجودة"
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
# Validation Logic
# ==========================================================

def validate_project_rows(rows):

    errors = []
    valid_rows = 0
    seen_cids = set()

    for excel_row, row in rows:

        row_errors = []

        title = _str(row.get("title"))
        university = _str(row.get("university"))
        college = _str(row.get("college"))
        department = _str(row.get("department"))

        supervisor_cid = _str(row.get("supervisor_cid"))
        email = _str(row.get("supervisor_email"))
        gender = _str(row.get("supervisor_gender"))

        start_year = _to_int(row.get("start_year"))
        end_year = _to_int(row.get("end_year"))

        # Required fields

        if not title:
            row_errors.append(("عنوان المشروع", "عنوان المشروع مطلوب"))

        if not university:
            row_errors.append(("الجامعة", "اسم الجامعة مطلوب"))

        if not college:
            row_errors.append(("الكلية", "اسم الكلية مطلوب"))

        if not department:
            row_errors.append(("القسم", "اسم القسم مطلوب"))

        if not supervisor_cid:
            row_errors.append(("الرقم الوطني للمشرف", "الرقم الوطني مطلوب"))

        # Year validation

        if start_year is None:
            row_errors.append(("سنة البداية", "سنة البداية يجب أن تكون رقم"))

        if end_year and start_year and end_year < start_year:
            row_errors.append(("سنة النهاية", "سنة النهاية يجب أن تكون أكبر من سنة البداية"))

        # CID validation

        if supervisor_cid:

            if not supervisor_cid.isdigit():
                row_errors.append(("الرقم الوطني", "يجب أن يحتوي أرقام فقط"))

            if supervisor_cid in seen_cids:
                row_errors.append(("الرقم الوطني", "تم تكرار الرقم الوطني في الملف"))

            seen_cids.add(supervisor_cid)

        # Email validation

        if email:
            pattern = r"[^@]+@[^@]+\.[^@]+"
            if not re.match(pattern, email):
                row_errors.append(("البريد الإلكتروني", "البريد الإلكتروني غير صحيح"))

        # Gender validation

        if gender and gender not in ["ذكر", "انثى"]:
            row_errors.append(("الجنس", "القيمة يجب أن تكون ذكر أو انثى"))

        # Duplicate project

        if title and Project.objects.filter(title=title).exists():
            row_errors.append(("عنوان المشروع", "المشروع موجود مسبقاً"))

        if row_errors:

            for field, message in row_errors:
                errors.append({
                    "row": excel_row,
                    "field": field,
                    "message": message
                })

        else:
            valid_rows += 1

    return errors, valid_rows


# ==========================================================
# VALIDATION API
# ==========================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def import_projects_validate(request):

    f = request.FILES.get("file")

    if not f:
        return Response({"detail": "لم يتم رفع ملف"}, status=400)

    rows, file_errors = read_excel_projects(f)

    if file_errors:
        return Response({
            "errors": file_errors,
            "valid_rows": 0,
            "invalid_rows": 0
        })

    errors, valid_rows = validate_project_rows(rows)

    return Response({
        "total_rows": len(rows),
        "valid_rows": valid_rows,
        "invalid_rows": len(errors),
        "errors": errors
    })


# ==========================================================
# COMMIT IMPORT
# ==========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def import_projects_commit(request):

    f = request.FILES.get("file")

    if not f:
        return Response({"detail": "No file uploaded"}, status=400)

    rows, file_errors = read_excel_projects(f)

    if file_errors:
        return Response({"errors": file_errors}, status=400)

    errors, valid_rows = validate_project_rows(rows)

    if errors:
        return Response({
            "message": "لا يمكن الاستيراد بسبب وجود أخطاء",
            "errors": errors
        }, status=400)

    created_projects = 0
    updated_projects = 0
    created_users = 0

    supervisor_role, _ = Role.objects.get_or_create(type="Supervisor", defaults={"role_type": "Faculty"})

    with transaction.atomic():

        for excel_row, row in rows:

            uni, _ = University.objects.get_or_create(uname_ar=_normalize(row["university"]))
            city_obj, _ = City.objects.get_or_create(bname_ar="المركز الرئيسي")
            branch_obj, _ = Branch.objects.get_or_create(university=uni, city=city_obj)

            col, _ = College.objects.get_or_create(branch=branch_obj, name_ar=_normalize(row["college"]))
            dep, _ = Department.objects.get_or_create(college=col, name=_normalize(row["department"]))

            sup_cid = _str(row.get("supervisor_cid"))
            supervisor_user = None

            if sup_cid:

                full_name = f"{_str(row.get('supervisor_first_name'))} {_str(row.get('supervisor_last_name'))}".strip()

                supervisor_user, created = User.objects.get_or_create(
                    username=sup_cid,
                    defaults={
                        "CID": sup_cid,
                        "name": full_name,
                        "phone": _str(row.get("supervisor_phone")),
                        "gender": _normalize(row.get("supervisor_gender")),
                        "email": _str(row.get("supervisor_email")),
                    }
                )

                if created:
                    supervisor_user.set_password("123456")
                    supervisor_user.save()
                    created_users += 1

                Staff.objects.get_or_create(
                    user=supervisor_user,
                    defaults={
                        "role": supervisor_role,
                        "Qualification": _str(row.get("supervisor_qualification")),
                    }
                )

            state_name = _normalize(row.get("state"))

            state_obj, _ = ProjectState.objects.get_or_create(
                name=STATE_MAP.get(state_name, "Pending")
            )

            p, created = Project.objects.update_or_create(
                title=_normalize(row["title"]),
                defaults={
                    "description": _str(row.get("description")),
                    "start_date": _to_int(row.get("start_year")),
                    "end_date": _to_int(row.get("end_year")),
                    "field": _str(row.get("field")),
                    "tools": _str(row.get("tools")),
                    "Logo": _str(row.get("Logo")),
                    "Documentation_Path": _str(row.get("Documentation_Path")),
                    "state": state_obj,
                    "created_by": supervisor_user,
                }
            )

            if created:
                created_projects += 1
            else:
                updated_projects += 1

    return Response({
        "message": "تم الاستيراد بنجاح 🎉",
        "total_rows": len(rows),
        "valid_rows": valid_rows,
        "created_projects": created_projects,
        "updated_projects": updated_projects,
        "users_created": created_users
    })
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def import_projects_template(request):

    wb = Workbook()
    ws = wb.active
    ws.title = "Projects"

    # Title row
    ws["A1"] = "استيراد المشاريع من Excel"
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(AR_HEADER_MAP))

    ws["A1"].font = Font(bold=True)

    # Headers row
    for col, header in enumerate(AR_HEADER_MAP.keys(), start=1):

        cell = ws.cell(row=2, column=col, value=header)
        cell.font = Font(bold=True)

    # Example row to guide users
    example = [
        "نظام إدارة المكتبة",      # title
        "مشروع لإدارة الكتب",      # description
        "معلق",                   # state
        "123456789",               # supervisor CID
        "محمد",                   # first name
        "أحمد",                   # last name
        "777777777",              # phone
        "test@test.com",          # email
        "دكتوراه",                # qualification
        "ذكر",                    # gender
        "", "", "", "", "", "",   # co supervisor
        2023,                     # start year
        2024,                     # end year
        "الذكاء الاصطناعي",       # field
        "Python, Django",         # tools
        "",                       # logo
        "جامعة صنعاء",            # university
        "كلية الحاسوب",           # college
        "علوم الحاسوب",           # department
        "",                       # documentation
        ""                        # students
    ]

    for col, value in enumerate(example, start=1):
        ws.cell(row=3, column=col, value=value)

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    response = HttpResponse(
        output.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    response["Content-Disposition"] = 'attachment; filename="projects_import_template.xlsx"'

    return response