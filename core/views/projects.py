from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated ,AllowAny
from django.utils import timezone
import django_filters
from django_filters.rest_framework import DjangoFilterBackend

from core.models import (
    User, Group, Project, ApprovalRequest, Role, College, UserRoles,
    AcademicAffiliation, ProjectState
)
from core.serializers import ProjectSerializer
from core.permissions import PermissionManager


class ProjectFilter(django_filters.FilterSet):
    state_name = django_filters.CharFilter(
        field_name="state__name",
        lookup_expr="iexact" # case insensitive exact match exact  => sensitive 
    )
    university = django_filters.NumberFilter(
        field_name= "group__programgroup_program_department_college_university__uid"
    )
    college = django_filters.NumberFilter(
        field_name="group__programgroup__program__department__college__cid"
    )
    department = django_filters.NumberFilter(
        field_name="group__programgroup__program__department__department_id"
    )
    supervisor = django_filters.NumberFilter(
        field_name="groups__groupsupervisors_set__user__id"
    )
    year = django_filters.NumberFilter(field_name="start_date")

    class Meta:
        model = Project
        fields = ["state_name", "college", "department", "supervisor", "year","university"]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("start_date")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ["title", "description"]
    ordering_fields = ["title", "start_date", "created_by__name", "state__name"]

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.all().order_by("-start_date")

        # Prefetch related group supervisors to avoid extra queries when serializing
        qs = qs.prefetch_related('groups__groupsupervisors_set__user')

        is_external = UserRoles.objects.filter(
            user=user,
            role__type__icontains="External"
        ).exists()

        if is_external:
            return qs.filter(created_by=user)

        if PermissionManager.is_student(user) or PermissionManager.is_admin(user):
            return qs

        if PermissionManager.is_supervisor(user):
            return qs.filter(
                groups__groupsupervisors_set__user=user
            ).distinct()

        return qs.none()

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()

            if not data.get("start_date"):
                data["start_date"] = timezone.now().date().isoformat()

            if "state" not in data:
                pending_state, _ = ProjectState.objects.get_or_create(name="Pending")
                data["state"] = pending_state.ProjectStateId
            else:
                try:
                    state_obj = ProjectState.objects.get(
                        name__iexact=data["state"]
                    )
                    data["state"] = state_obj.ProjectStateId
                except ProjectState.DoesNotExist:
                    return Response(
                        {"error": f"Invalid project state: {data['state']}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(created_by=request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=["get"], url_path="filter-options")
    def filter_options(self, request):
        try:
            colleges = College.objects.values("cid", "name_ar")
            college_list = [{"id": c["cid"], "name": c["name_ar"]} for c in colleges]

            active_supervisors = User.objects.filter(
                groupsupervisors__isnull=False
            ).distinct().values("id", "name")
            supervisor_list = [
                {"id": s["id"], "name": s["name"] or "Unnamed Supervisor"}
                for s in active_supervisors
            ]

            years_qs = Project.objects.values_list(
                "start_date", flat=True
            ).distinct().order_by("-start_date")
            years = [str(y) for y in years_qs if y is not None]

            states = ProjectState.objects.values_list(
                "name", flat=True
            ).distinct()

            return Response({
                "colleges": college_list,
                "supervisors": supervisor_list,
                "years": years,
                "states": list(states),
            })
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["get"])
    def my_project(self, request):
        user = request.user

        if not PermissionManager.is_student(user):
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        project = Project.objects.filter(
            groups__groupmembers__user=user
        ).first()

        if not project:
            return Response(
                {"message": "No project found for this student"},
                status=status.HTTP_200_OK
            )

        return Response(self.get_serializer(project).data)

    @action(detail=False, methods=["post"], url_path="propose-project")
    def propose_project(self, request):
        data = request.data.copy()
        user = request.user

        pending_state, _ = ProjectState.objects.get_or_create(name="Pending")
        data["state"] = pending_state.ProjectStateId

        data.pop("type", None)
        data.pop("college_id", None)
        data.pop("department_id", None)

        if not data.get("start_date"):
            data["start_date"] = timezone.now().date().isoformat()

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        new_project = serializer.save(created_by=user)

        return Response(
            {
                "project_id": new_project.project_id,
                "message": "Project proposed successfully",
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["post"])
    def propose(self, request):
        user = request.user
        title = request.data.get("title")
        description = request.data.get("description")

        if not title or not description:
            return Response(
                {"error": "Title and description are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            pending_state, _ = ProjectState.objects.get_or_create(name="Pending")

            project = Project.objects.create(
                title=title,
                description=description,
                state=pending_state,
                created_by=user,
                start_date=timezone.now().date().year
            )

            try:
                dept_head_role = Role.objects.filter(
                    type__icontains="Department Head"
                ).first()
                if dept_head_role:
                    dept_head_user_role = UserRoles.objects.filter(
                        role=dept_head_role
                    ).first()
                    if dept_head_user_role:
                        ApprovalRequest.objects.create(
                            approval_type="project_proposal",
                            project=project,
                            requested_by=user,
                            current_approver=dept_head_user_role.user,
                            status="pending"
                        )
            except Exception:
                pass

            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["patch", "put"])
    def update_project(self, request, pk=None):
        project = self.get_object()

        if project.created_by != request.user:
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(
            project, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["delete"])
    def delete_project(self, request, pk=None):
        project = self.get_object()
        user = request.user
        user_can_delete = False

        if PermissionManager.has_permission(user, "delete_project"):
            user_can_delete = True
        elif project.created_by == user:
            user_can_delete = True
        elif PermissionManager.is_admin(user):
            user_affiliation = AcademicAffiliation.objects.filter(
                user=user
            ).order_by("-start_date").first()

            if user_affiliation and user_affiliation.college:
                if Group.objects.filter(
                    project=project,
                    program_groups__program__department__college=user_affiliation.college
                ).exists():
                    user_can_delete = True

        if not user_can_delete:
            return Response(
                {"error": "Unauthorized - You do not have permission to delete this project"},
                status=status.HTTP_403_FORBIDDEN
            )

        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dropdown_data(request):
    user = request.user

    user_affiliation = AcademicAffiliation.objects.filter(
        user=user
    ).order_by("-start_date").first()
    user_department = user_affiliation.department if user_affiliation else None
    user_college = user_affiliation.college if user_affiliation else None

    if PermissionManager.is_student(user) and user_department:
        student_role = Role.objects.filter(type="Student").first()
        students = (
            User.objects.filter(
                userroles__role=student_role,
                academicaffiliation__department=user_department
            )
            .exclude(id=user.id)
            .distinct()
            if student_role else User.objects.none()
        )
    else:
        students = User.objects.filter(
            userroles__role__type="Student"
        ).exclude(id=user.id).distinct()

    if user_college:
        supervisor_role = Role.objects.filter(type="supervisor").first()
        supervisors = (
            User.objects.filter(
                userroles__role=supervisor_role,
                academicaffiliation__college=user_college
            ).distinct()
            if supervisor_role else User.objects.none()
        )
    else:
        supervisors = User.objects.filter(
            userroles__role__type="supervisor"
        ).distinct()

    if user_college:
        co_supervisor_role = Role.objects.filter(type="Co-supervisor").first()
        assistants = (
            User.objects.filter(
                userroles__role=co_supervisor_role,
                academicaffiliation__college=user_college
            ).distinct()
            if co_supervisor_role else User.objects.none()
        )
    else:
        assistants = User.objects.filter(
            userroles__role__type="Co-supervisor"
        ).distinct()

    return Response({
        "students": [{"id": s.id, "name": s.name} for s in students],
        "supervisors": [{"id": sp.id, "name": sp.name} for sp in supervisors],
        "assistants": [{"id": a.id, "name": a.name} for a in assistants],
    })