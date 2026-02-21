from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models.functions import ExtractYear
import django_filters
from django_filters.rest_framework import DjangoFilterBackend

from core.models import (
    User, Group,Project, ApprovalRequest, Role,  College,  UserRoles
)
from core.serializers.projects import (
   ProjectSerializer,
)

from core.permissions import PermissionManager


class ProjectFilter(django_filters.FilterSet):
    project_type = django_filters.NumberFilter(field_name="project_type__id")
    state = django_filters.NumberFilter(field_name="state__id")
    college = django_filters.NumberFilter(field_name="groups__program__department__college__cid")
    department = django_filters.NumberFilter(field_name="groups__program__department__department_id")
    supervisor = django_filters.NumberFilter(field_name="groups__groupsupervisors__user__id")
    year = django_filters.NumberFilter(field_name="start_date__year")

    class Meta:
        model = Project
        fields = ['project_type', 'state', 'college', 'department', 'supervisor', 'year']


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-start_date')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.all().order_by('-start_date')
        project_type = self.request.query_params.get("type")
        if project_type:
            qs = qs.filter(type=project_type)
        
        # التحقق من دور الشركة الخارجية
        is_external = UserRoles.objects.filter(user=user, role__type__icontains='External').exists()
        
        if is_external:
            # عرض المشاريع التي أنشأتها هذه الشركة فقط
            return qs.filter(created_by=user)
        
        if PermissionManager.is_student(user) or PermissionManager.is_admin(user):
            return qs
        if PermissionManager.is_supervisor(user):
            return qs.filter(groups__groupsupervisors__user=user).distinct()
        return qs.none()

    def create(self, request, *args, **kwargs):
        """Override create to default missing start_date to today and set created_by."""
        try:
            data = request.data.copy()
            if not data.get('start_date'):
                data['start_date'] = timezone.now().date().isoformat()

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            # Save with created_by set to request.user if serializer/model allows it
            instance = serializer.save(created_by=request.user)
            out_serializer = self.get_serializer(instance)
            return Response(out_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Project create failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='filter-options')
    def filter_options(self, request):
        try:
            colleges = College.objects.values('cid', 'name_ar')
            college_list = [{"id": c['cid'], "name": c['name_ar']} for c in colleges]

            active_supervisors = User.objects.filter(groupsupervisors__isnull=False).distinct().values('id', 'first_name', 'last_name')
            supervisor_list = [{"id": s['id'], "name": f"{s['first_name']} {s['last_name']}".strip() or "Unnamed Supervisor"} for s in active_supervisors]

            years_qs = Project.objects.annotate(year=ExtractYear('start_date')).values_list('year', flat=True).distinct().order_by('-year')
            years = [str(int(y)) for y in years_qs if y is not None]

            return Response({
                "colleges": college_list,
                "supervisors": supervisor_list,
                "years": years if years else ["2025"],
                "types": list(Project.objects.values_list('type', flat=True).distinct()),
                "states": list(Project.objects.values_list('state', flat=True).distinct())
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def my_project(self, request):
        user = request.user
        if not PermissionManager.is_student(user):
            return Response({'error': 'Unauthorized'}, status=403)
        project = Project.objects.filter(group__groupmembers__user=user).first()
        if not project:
            return Response({'message': 'No project found'}, status=200)
        return Response(ProjectSerializer(project).data)


#afnan add it

    @action(detail=False, methods=['post'], url_path='propose-project')
    def propose_project(self, request):
        data = request.data
        user = request.user
        
        # شغل نظيف: التأكد من تخزين القيم حسب الـ Choices في الموديل
        new_project = Project.objects.create(
        title=data.get('title'),
        description=data.get('description'),
        type='ProposedProject',
        state='Pending',
        start_date=timezone.now().date(),
        created_by=user,
        # جلب المعرفات مباشرة إذا كان المستخدم طالباً
        college_id=getattr(user, 'college_id', None),
        department_id=getattr(user, 'department_id', None)
             )
        
        return Response({
            "project_id": new_project.project_id,
            "message": "Project proposed successfully"
        }, status=201)

    @action(detail=False, methods=['post'])
    def propose(self, request):
        user = request.user
        title = request.data.get('title')
        description = request.data.get('description')
        
        if not title or not description:
            return Response({'error': 'Title and description are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # إنشاء المشروع مع تعيين created_by لضمان المزامنة
            project = Project.objects.create(
                title=title,
                description=description,
                type='PrivateCompany',
                state='Pending',
                created_by=user,
                start_date=timezone.now().date()
            )
            
            # محاولة إنشاء طلب موافقة تلقائي
            try:
                # البحث عن دور رئيس القسم
                dept_head_role = Role.objects.filter(type__icontains='Department Head').first()
                if dept_head_role:
                    dept_head = UserRoles.objects.filter(role=dept_head_role).first()
                    if dept_head:
                        ApprovalRequest.objects.create(
                            approval_type='external_project',
                            project=project,
                            requested_by=user,
                            current_approver=dept_head.user,
                            status='pending'
                        )
            except Exception as e:
                print(f"Approval request creation failed: {e}")

            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Project creation failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch', 'put'])
    def update_project(self, request, pk=None):
        project = self.get_object()
        if project.created_by != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_project(self, request, pk=None):
        project = self.get_object()

        # Check if user has delete permission or is the project creator
        from permissions import PermissionManager
        user_can_delete = False

        # User can delete if they have the permission
        if PermissionManager.has_permission(request.user, 'delete_project'):
            user_can_delete = True
        # Or if they are the project creator
        elif project.created_by == request.user:
            user_can_delete = True
        # Or if they are a dean/admin and the project belongs to their college
        elif PermissionManager.is_admin(request.user):
            # Get user's college from their affiliation
            user_affiliation = request.user.academicaffiliation_set.order_by('-start_date').first()
            if user_affiliation and user_affiliation.college:
                # Check if project belongs to dean's college (via groups/departments)
                
                project_groups = Group.objects.filter(project=project)
                for group in project_groups:
                    if group.department and group.department.college == user_affiliation.college:
                        user_can_delete = True
                        break
                # Also check direct project college if no groups found
                if not user_can_delete and project.college == user_affiliation.college:
                    user_can_delete = True

        if not user_can_delete:
            return Response({'error': 'Unauthorized - You do not have permission to delete this project'}, status=status.HTTP_403_FORBIDDEN)

        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================================
# 6. Dropdown data API
# ============================================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dropdown_data(request):
    user = request.user
    user_affiliation = user.academicaffiliation_set.order_by('-start_date').first()
    user_department = user_affiliation.department if user_affiliation else None
    user_college = user_affiliation.college if user_affiliation else None

    # Students
    if PermissionManager.is_student(user) and user_department:
        student_role = Role.objects.filter(type='Student').first()
        students = User.objects.filter(userroles__role=student_role, academicaffiliation__department=user_department).exclude(id=user.id).distinct() if student_role else User.objects.none()
    else:
        students = User.objects.filter(userroles__role__type='Student').exclude(id=user.id).distinct()

    # Supervisors
    if user_college:
        supervisor_role = Role.objects.filter(type='supervisor').first()
        supervisors = User.objects.filter(userroles__role=supervisor_role, academicaffiliation__college=user_college).distinct() if supervisor_role else User.objects.none()
    else:
        supervisors = User.objects.filter(userroles__role__type='supervisor').distinct()

    # Co-supervisors
    if user_college:
        co_supervisor_role = Role.objects.filter(type='Co-supervisor').first()
        assistants = User.objects.filter(userroles__role=co_supervisor_role, academicaffiliation__college=user_college).distinct() if co_supervisor_role else User.objects.none()
    else:
        assistants = User.objects.filter(userroles__role__type='Co-supervisor').distinct()

    return Response({
        "students": [{"id": s.id, "name": s.name} for s in students],
        "supervisors": [{"id": sp.id, "name": sp.name} for sp in supervisors],
        "assistants": [{"id": a.id, "name": a.name} for a in assistants]
    })