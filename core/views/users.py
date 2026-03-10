from core import models
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse

from core.serializers.users import (
    UserSerializer,
    StudentSerializer,
    ExternalCompanySerializer,
)

from core.models import (
    User,
    UserRoles,
    Role,
    Group,
    GroupMembers,
    GroupSupervisors,
    Project,
    AcademicAffiliation,
    GroupMemberApproval,
    NotificationLog,
    College,
    Department,
    Staff,
    Student,
    check_and_finalize_group,
)


# =============================================================================
# User ViewSet (CREATE / UPDATE with roles and CID support)
# =============================================================================
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # synchronize roles if provided
        role_ids = request.data.get('write_roles') or request.data.get('roles')
        if isinstance(role_ids, list):
            cleaned = []
            for r in role_ids:
                if isinstance(r, dict) and 'id' in r:
                    cleaned.append(int(r['id']))
                else:
                    try:
                        cleaned.append(int(r))
                    except Exception:
                        continue
            role_ids = cleaned

            UserRoles.objects.filter(user=user).exclude(role_id__in=role_ids).delete()
            for rid in role_ids:
                UserRoles.objects.get_or_create(user=user, role_id=rid)

        return Response(self.get_serializer(user).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # synchronize roles if provided
        role_ids = request.data.get('write_roles') or request.data.get('roles')
        if isinstance(role_ids, list):
            cleaned = []
            for r in role_ids:
                if isinstance(r, dict) and 'id' in r:
                    cleaned.append(int(r['id']))
                else:
                    cleaned.append(int(r))
            role_ids = cleaned

            UserRoles.objects.filter(user=user).exclude(role_id__in=role_ids).delete()
            existing = set(UserRoles.objects.filter(user=user).values_list('role_id', flat=True))
            for rid in role_ids:
                if rid not in existing:
                    UserRoles.objects.create(user=user, role_id=rid)

        return Response(self.get_serializer(user).data)


# =============================================================================
# Get all users
# =============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# =============================================================================
# Bulk Fetch API
# =============================================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_fetch(request):
    """
    POST body:
    {
      "requests": [
        { "table": "projects", "fields": ["project_id", "title"] }
      ]
    }
    """
    mapping = {
        'projects': Project,
        'groups': Group,
        'group_members': GroupMembers,
        'group_supervisors': GroupSupervisors,
        'users': User,
        'staff': Staff,
        'academic_affiliations': AcademicAffiliation,
        'colleges': College,
        'departments': Department,
    }

    out = {}
    try:
        reqs = request.data.get('requests', [])
        import traceback

        for r in reqs:
            table = r.get('table')
            if not table or table not in mapping:
                out[table or 'unknown'] = {'error': 'unsupported table'}
                continue

            model = mapping[table]
            if r.get('fields'):
                fields = r.get('fields')
            else:
                pk = model._meta.pk.name
                extra = [f.name for f in model._meta.fields if f.name != pk]
                fields = [pk] + extra[:6]

            try:
                qs = model.objects.all().values(*fields)

                if table == 'projects':
                    user = request.user
                    is_external = UserRoles.objects.filter(
                        user=user,
                        role__type__icontains='External'
                    ).exists()
                    if is_external:
                        qs = qs.filter(created_by=user)

                out[table] = list(qs)

            except Exception as e:
                out[table] = {'error': str(e), 'traceback': traceback.format_exc()}

        return JsonResponse(out, safe=True)

    except Exception as e:
        import traceback
        return JsonResponse({'error': str(e), 'traceback': traceback.format_exc()}, status=400)


# =============================================================================
# Respond to Group Creation Request
# =============================================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_group_request(request, approval_id):
    user = request.user
    response_status = 'accepted' if 'approve' in request.path else 'rejected'

    try:
        with transaction.atomic():
            member_status = get_object_or_404(GroupMemberApproval, id=approval_id, user=user)

            if member_status.status != 'pending':
                return Response({"error": "تم الرد مسبقاً"}, status=400)

            member_status.status = response_status
            member_status.responded_at = timezone.now()
            member_status.save()

            NotificationLog.objects.filter(
                recipient=user,
                related_id=approval_id,
                notification_type='invitation'
            ).update(is_read=True, read_at=timezone.now())

            if response_status == 'accepted':
                check_and_finalize_group(member_status.request.id)

            return Response({"message": "تمت العملية بنجاح"}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:  # superuser يرى كل الطلاب
            return Student.objects.all()

        # فلترة المستخدم العادي حسب الكلية والقسم
        affiliation = AcademicAffiliation.objects.filter(user=user).first()
        if affiliation and affiliation.department and affiliation.college:
            return Student.objects.filter(
                department=affiliation.department,
                college=affiliation.college
            )
        return Student.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def count(self, request):
        """
        Public endpoint to get the total number of students.
        Accessible to anyone.
        """
        total = Student.objects.count()
        return Response({"total_students": total})
    
class ExternalCompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(userroles__role__type__icontains='External')
    serializer_class = ExternalCompanySerializer
    permission_classes = [IsAuthenticated]
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def students_by_department(request):
    user = request.user

    # 1. تحقق أن المستخدم مرتبط بقسم
    affiliation = AcademicAffiliation.objects.filter(user=user).first()
    if not affiliation or not affiliation.department:
        return Response({"error": "لا يوجد قسم مرتبط بالمستخدم"}, status=400)

    department = affiliation.department

    # 2. جلب دور الطلاب
    student_role = Role.objects.filter(type__icontains="Student").first()
    if not student_role:
        return Response({"error": "لا يوجد دور Student معرف"}, status=500)

    # 3. جلب الطلاب في القسم
    students = User.objects.filter(
        userroles__role=student_role,
        academicaffiliation__department=department
    ).distinct()

    # 4. تحويل البيانات للـ JSON باستخدام Serializer
    serializer = UserSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def students_by_department(request):
    dept_id = request.query_params.get('department_id')
    if not dept_id:
        return Response({"error": "department_id required"}, status=400)
    students = Student.objects.filter(department_id=dept_id)
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)
