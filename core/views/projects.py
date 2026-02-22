# from rest_framework import viewsets, status, filters
# from rest_framework.response import Response
# from rest_framework.decorators import action, api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from django.db.models.functions import ExtractYear
# import django_filters
# from django_filters.rest_framework import DjangoFilterBackend

# from core.models import (
#     User, Group,Project, ApprovalRequest, Role,  College,  UserRoles
# )
# from core.serializers.projects import (
#    ProjectSerializer,
# )

# from core.permissions import PermissionManager


# class ProjectFilter(django_filters.FilterSet):
#     project_type = django_filters.NumberFilter(field_name="project_type__id")
#     state = django_filters.NumberFilter(field_name="state__id")
#     college = django_filters.NumberFilter(field_name="groups__program__department__college__cid")
#     department = django_filters.NumberFilter(field_name="groups__program__department__department_id")
#     supervisor = django_filters.NumberFilter(field_name="groups__groupsupervisors__user__id")
#     year = django_filters.NumberFilter(field_name="start_date__year")

#     class Meta:
#         model = Project
#         fields = ['project_type', 'state', 'college', 'department', 'supervisor']


# class ProjectViewSet(viewsets.ModelViewSet):
#     queryset = Project.objects.all().order_by('start_date')
#     serializer_class = ProjectSerializer
#     permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_class = ProjectFilter
#     search_fields = ['title', 'description']

#     def get_queryset(self):
#         user = self.request.user
#         qs = Project.objects.all().order_by('-start_date')
#         project_type = self.request.query_params.get("type")
#         if project_type:
#             qs = qs.filter(type=project_type)
        
#         # التحقق من دور الشركة الخارجية
#         is_external = UserRoles.objects.filter(user=user, role__type__icontains='External').exists()
        
#         if is_external:
#             # عرض المشاريع التي أنشأتها هذه الشركة فقط
#             return qs.filter(created_by=user)
        
#         if PermissionManager.is_student(user) or PermissionManager.is_admin(user):
#             return qs
#         if PermissionManager.is_supervisor(user):
#             return qs.filter(groups__groupsupervisors__user=user).distinct()
#         return qs.none()

#     def create(self, request, *args, **kwargs):
#         """Override create to default missing start_date to today and set created_by."""
#         try:
#             data = request.data.copy()
#             if not data.get('start_date'):
#                 data['start_date'] = timezone.now().date().isoformat()

#             serializer = self.get_serializer(data=data)
#             serializer.is_valid(raise_exception=True)
#             # Save with created_by set to request.user if serializer/model allows it
#             instance = serializer.save(created_by=request.user)
#             out_serializer = self.get_serializer(instance)
#             return Response(out_serializer.data, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             print(f"Project create failed: {e}")
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['get'], url_path='filter-options')
#     def filter_options(self, request):
#         try:
#             colleges = College.objects.values('cid', 'name_ar')
#             college_list = [{"id": c['cid'], "name": c['name_ar']} for c in colleges]

#             active_supervisors = User.objects.filter(groupsupervisors__isnull=False).distinct().values('id', 'first_name', 'last_name')
#             supervisor_list = [{"id": s['id'], "name": f"{s['first_name']} {s['last_name']}".strip() or "Unnamed Supervisor"} for s in active_supervisors]

#             years_qs = Project.objects.annotate(year=ExtractYear('start_date')).values_list('year', flat=True).distinct().order_by('-year')
#             years = [str(int(y)) for y in years_qs if y is not None]

#             return Response({
#                 "colleges": college_list,
#                 "supervisors": supervisor_list,
#                 "years": years if years else ["2025"],
#                 "types": list(Project.objects.values_list('type', flat=True).distinct()),
#                 "states": list(Project.objects.values_list('state', flat=True).distinct())
#             })
#         except Exception as e:
#             return Response({"error": str(e)}, status=500)

#     @action(detail=False, methods=['get'])
#     def my_project(self, request):
#         user = request.user
#         if not PermissionManager.is_student(user):
#             return Response({'error': 'Unauthorized'}, status=403)
#         project = Project.objects.filter(group__groupmembers__user=user).first()
#         if not project:
#             return Response({'message': 'No project found'}, status=200)
#         return Response(ProjectSerializer(project).data)


# #afnan add it

#     @action(detail=False, methods=['post'], url_path='propose-project')
#     def propose_project(self, request):
#         data = request.data
#         user = request.user
        
#         # شغل نظيف: التأكد من تخزين القيم حسب الـ Choices في الموديل
#         new_project = Project.objects.create(
#         title=data.get('title'),
#         description=data.get('description'),
#         type='ProposedProject',
#         state='Pending',
#         start_date=timezone.now().date(),
#         created_by=user,
#         # جلب المعرفات مباشرة إذا كان المستخدم طالباً
#         college_id=getattr(user, 'college_id', None),
#         department_id=getattr(user, 'department_id', None)
#              )
        
#         return Response({
#             "project_id": new_project.project_id,
#             "message": "Project proposed successfully"
#         }, status=201)

#     @action(detail=False, methods=['post'])
#     def propose(self, request):
#         user = request.user
#         title = request.data.get('title')
#         description = request.data.get('description')
        
#         if not title or not description:
#             return Response({'error': 'Title and description are required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # إنشاء المشروع مع تعيين created_by لضمان المزامنة
#             project = Project.objects.create(
#                 title=title,
#                 description=description,
#                 type='PrivateCompany',
#                 state='Pending',
#                 created_by=user,
#                 start_date=timezone.now().date()
#             )
            
#             # محاولة إنشاء طلب موافقة تلقائي
#             try:
#                 # البحث عن دور رئيس القسم
#                 dept_head_role = Role.objects.filter(type__icontains='Department Head').first()
#                 if dept_head_role:
#                     dept_head = UserRoles.objects.filter(role=dept_head_role).first()
#                     if dept_head:
#                         ApprovalRequest.objects.create(
#                             approval_type='external_project',
#                             project=project,
#                             requested_by=user,
#                             current_approver=dept_head.user,
#                             status='pending'
#                         )
#             except Exception as e:
#                 print(f"Approval request creation failed: {e}")

#             serializer = self.get_serializer(project)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             print(f"Project creation failed: {e}")
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @action(detail=True, methods=['patch', 'put'])
#     def update_project(self, request, pk=None):
#         project = self.get_object()
#         if project.created_by != request.user:
#             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
#         serializer = self.get_serializer(project, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=True, methods=['delete'])
#     def delete_project(self, request, pk=None):
#         project = self.get_object()

#         # Check if user has delete permission or is the project creator
#         from permissions import PermissionManager
#         user_can_delete = False

#         # User can delete if they have the permission
#         if PermissionManager.has_permission(request.user, 'delete_project'):
#             user_can_delete = True
#         # Or if they are the project creator
#         elif project.created_by == request.user:
#             user_can_delete = True
#         # Or if they are a dean/admin and the project belongs to their college
#         elif PermissionManager.is_admin(request.user):
#             # Get user's college from their affiliation
#             user_affiliation = request.user.academicaffiliation_set.order_by('-start_date').first()
#             if user_affiliation and user_affiliation.college:
#                 # Check if project belongs to dean's college (via groups/departments)
                
#                 project_groups = Group.objects.filter(project=project)
#                 for group in project_groups:
#                     if group.department and group.department.college == user_affiliation.college:
#                         user_can_delete = True
#                         break
#                 # Also check direct project college if no groups found
#                 if not user_can_delete and project.college == user_affiliation.college:
#                     user_can_delete = True

#         if not user_can_delete:
#             return Response({'error': 'Unauthorized - You do not have permission to delete this project'}, status=status.HTTP_403_FORBIDDEN)

#         project.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# # ============================================================================================
# # 6. Dropdown data API
# # ============================================================================================

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def dropdown_data(request):
#     user = request.user
#     user_affiliation = user.academicaffiliation_set.order_by('-start_date').first()
#     user_department = user_affiliation.department if user_affiliation else None
#     user_college = user_affiliation.college if user_affiliation else None

#     # Students
#     if PermissionManager.is_student(user) and user_department:
#         student_role = Role.objects.filter(type='Student').first()
#         students = User.objects.filter(userroles__role=student_role, academicaffiliation__department=user_department).exclude(id=user.id).distinct() if student_role else User.objects.none()
#     else:
#         students = User.objects.filter(userroles__role__type='Student').exclude(id=user.id).distinct()

#     # Supervisors
#     if user_college:
#         supervisor_role = Role.objects.filter(type='supervisor').first()
#         supervisors = User.objects.filter(userroles__role=supervisor_role, academicaffiliation__college=user_college).distinct() if supervisor_role else User.objects.none()
#     else:
#         supervisors = User.objects.filter(userroles__role__type='supervisor').distinct()

#     # Co-supervisors
#     if user_college:
#         co_supervisor_role = Role.objects.filter(type='Co-supervisor').first()
#         assistants = User.objects.filter(userroles__role=co_supervisor_role, academicaffiliation__college=user_college).distinct() if co_supervisor_role else User.objects.none()
#     else:
#         assistants = User.objects.filter(userroles__role__type='Co-supervisor').distinct()

#     return Response({
#         "students": [{"id": s.id, "name": s.name} for s in students],
#         "supervisors": [{"id": sp.id, "name": sp.name} for sp in supervisors],
#         "assistants": [{"id": a.id, "name": a.name} for a in assistants]
#     })


from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models.functions import ExtractYear
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

# Import all necessary models from your core application
from core.models import (
    User, Group, Project, ApprovalRequest, Role, College, Department, UserRoles,
    AcademicAffiliation, ProjectState, Program, GroupSupervisors
)
# Import your Project serializer
from core.serializers import ProjectSerializer # Assuming serializers are in a 'serializers' folder within the app

# Import your custom permission manager
from core.permissions import PermissionManager


# ==============================================================================
# 1. Project Filtering
#    Defines how projects can be filtered in the API.
# ==============================================================================
class ProjectFilter(django_filters.FilterSet):
    # Filter by the name of the project state (e.g., 'Pending', 'Approved')
    # Uses 'name__iexact' for case-insensitive exact match on the ProjectState model's name field.
    state_name = django_filters.CharFilter(field_name="state__name", lookup_expr=
'iexact')
    
    # Filter by college ID associated with the project's group's department
    # This path is: Project -> Group -> ProgramGroup -> Program -> Department -> College
    # Note: The original models.py had a clean method in Group that checked program, 
    # but Group itself doesn't have a direct 'program' field. 
    # We'll assume a relationship can be traversed via Group's project to its associated groups, 
    # and then to programs if programgroup is used.
    # For simplicity and based on the provided models, we'll assume a project is linked to a group,
    # and that group is linked to a program via ProgramGroup, which then links to a department and college.
    # If a Project can be directly associated with a College/Department, those fields should be added to Project model.
    # For now, we'll use the path through Group and ProgramGroup.
    college = django_filters.NumberFilter(field_name="group__programgroup__program__department__college__cid")
    
    # Filter by department ID associated with the project's group
    department = django_filters.NumberFilter(field_name="group__programgroup__program__department__department_id")
    
    # Filter by supervisor user ID associated with the project's group
    supervisor = django_filters.NumberFilter(field_name="group__groupsupervisors__user__id")
    
    # Filter by the start year of the project
    # Uses 'start_date' which is an IntegerField for year, so direct filtering is possible.
    year = django_filters.NumberFilter(field_name="start_date")

    class Meta:
        model = Project
        # Define the fields that can be used for filtering
        fields = ["state_name", "college", "department", "supervisor", "year"]


# ==============================================================================
# 2. Project ViewSet
#    Handles CRUD operations and custom actions for Project model.
# ==============================================================================
class ProjectViewSet(viewsets.ModelViewSet):
    # Base queryset for all actions. Orders projects by their start date.
    queryset = Project.objects.all().order_by("start_date")
    # Serializer class to convert Project model instances to/from JSON.
    serializer_class = ProjectSerializer
    # Permissions required to access this viewset. User must be authenticated.
    permission_classes = [IsAuthenticated]
    # Backend classes for filtering, searching, and ordering the queryset.
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # The filterset class defined above for advanced filtering.
    filterset_class = ProjectFilter
    # Fields that can be searched using the 'search' query parameter.
    search_fields = ["title", "description"]
    # Fields that can be used for ordering the results.
    ordering_fields = ["title", "start_date", "created_by__name", "state__name"]

    def get_queryset(self):
        """
        Custom queryset retrieval based on user roles and permissions.
        - External users only see projects they created.
        - Students and Admins see all projects.
        - Supervisors see projects associated with groups they supervise.
        """
        user = self.request.user
        qs = Project.objects.all().order_by("-start_date")

        # Check if the user has an 'External' role
        is_external = UserRoles.objects.filter(user=user, role__type__icontains='External').exists()
        
        if is_external:
            # External users can only view projects they have created.
            return qs.filter(created_by=user)
        
        # Check user roles using the PermissionManager
        if PermissionManager.is_student(user) or PermissionManager.is_admin(user):
            # Students and Admins have broad access to projects.
            return qs
        
        if PermissionManager.is_supervisor(user):
            # Supervisors can view projects linked to groups they supervise.
            # 'groupsupervisors__user' links through the GroupSupervisors model.
            return qs.filter(group__groupsupervisors__user=user).distinct()
        
        # If no specific role matches, return an empty queryset.
        return qs.none()

    def create(self, request, *args, **kwargs):
        """
        Handles the creation of a new project.
        - Automatically sets 'start_date' to today if not provided.
        - Sets 'created_by' to the requesting user.
        - Ensures 'state' is set to a valid ProjectState object (e.g., 'Pending').
        """
        try:
            data = request.data.copy()
            
            # If 'start_date' is not provided, default it to the current date.
            if not data.get("start_date"):
                data["start_date"] = timezone.now().date().isoformat()
            
            # Ensure 'state' is handled correctly. It should be a ProjectState object.
            # Assuming 'Pending' is a valid ProjectState name.
            if "state" not in data:
                pending_state, created = ProjectState.objects.get_or_create(name="Pending")
                data["state"] = pending_state.ProjectStateId # Assign the ID of the ProjectState object
            else:
                # If state name is provided, try to get its ID
                try:
                    state_obj = ProjectState.objects.get(name__iexact=data["state"])
                    data["state"] = state_obj.ProjectStateId
                except ProjectState.DoesNotExist:
                    return Response({"error": f"Invalid project state: {data["state"]}"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate the incoming data using the serializer.
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            
            # Save the project, setting 'created_by' to the current user.
            # The serializer's create method will handle the ProjectState ID.
            instance = serializer.save(created_by=request.user)
            
            # Return the serialized project data with a 201 Created status.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log the error and return a 400 Bad Request response.
            print(f"Project creation failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="filter-options")
    def filter_options(self, request):
        """
        Provides options for filtering projects, such as colleges, supervisors, and years.
        This helps populate dropdowns in a frontend application.
        """
        try:
            # Retrieve all colleges with their IDs and Arabic names.
            colleges = College.objects.values("cid", "name_ar")
            college_list = [{"id": c["cid"], "name": c["name_ar"]} for c in colleges]

            # Retrieve active supervisors (users linked to GroupSupervisors).
            # Uses 'name' field from the User model for display.
            active_supervisors = User.objects.filter(groupsupervisors__isnull=False).distinct().values("id", "name")
            supervisor_list = [{"id": s["id"], "name": s["name"] or "Unnamed Supervisor"} for s in active_supervisors]

            # Extract distinct start years from projects.
            # 'start_date' is an IntegerField, so direct use is fine.
            years_qs = Project.objects.values_list("start_date", flat=True).distinct().order_by("-start_date")
            years = [str(y) for y in years_qs if y is not None]

            # Retrieve distinct project states.
            # The Project model has a ForeignKey to ProjectState, so we get the names.
            states = ProjectState.objects.values_list("name", flat=True).distinct()

            return Response({
                "colleges": college_list,
                "supervisors": supervisor_list,
                "years": years if years else [], # Return empty list if no years
                "states": list(states)
            })
        except Exception as e:
            # Log the error and return a 500 Internal Server Error response.
            print(f"Error fetching filter options: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def my_project(self, request):
        """
        Retrieves the project associated with the requesting student user.
        """
        user = request.user
        # Only students should access this endpoint.
        if not PermissionManager.is_student(user):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Find a project where the current user is a member of its group.
        # Project -> Group -> GroupMembers -> User
        project = Project.objects.filter(group__groupmembers__user=user).first()
        
        if not project:
            return Response({"message": "No project found for this student"}, status=status.HTTP_200_OK)
        
        # Serialize and return the project data.
        return Response(self.get_serializer(project).data)

    @action(detail=False, methods=["post"], url_path="propose-project")
    def propose_project(self, request):
        """
        Allows a user to propose a new project.
        - Sets 'created_by' to the requesting user.
        - Sets 'state' to 'Pending' (ProjectState object).
        - Note: The original code attempted to set college_id/department_id directly on Project,
          which are not fields in the Project model. These have been removed.
          If a project needs to be linked to a college/department, this should be done via a Group
          or by adding direct fields to the Project model.
        """
        data = request.data.copy()
        user = request.user

        # Ensure the project state is 'Pending' by getting or creating the ProjectState object.
        pending_state, created = ProjectState.objects.get_or_create(name="Pending")
        data["state"] = pending_state.ProjectStateId # Assign the ID

        # The Project model does not have a 'type' field, nor 'college_id' or 'department_id'.
        # These fields are removed from the creation data.
        data.pop("type", None) # Remove if present, as Project model doesn't have it
        data.pop("college_id", None)
        data.pop("department_id", None)

        # Set 'start_date' if not provided
        if not data.get("start_date"):
            data["start_date"] = timezone.now().date().isoformat()

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Save the new project, linking it to the current user.
        new_project = serializer.save(created_by=user)
        
        return Response({
            "project_id": new_project.project_id,
            "message": "Project proposed successfully"
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def propose(self, request):
        """
        Allows a user (e.g., an external company) to propose a project.
        - Creates a new Project instance.
        - Attempts to create an ApprovalRequest for the project, targeting a Department Head.
        - Note: The original code attempted to set a 'type' field on Project, which does not exist.
          This has been removed. The 'state' is correctly set to 'Pending'.
        """
        user = request.user
        title = request.data.get("title")
        description = request.data.get("description")
        
        if not title or not description:
            return Response({"error": "Title and description are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get or create the 'Pending' ProjectState object.
            pending_state, created = ProjectState.objects.get_or_create(name="Pending")

            # Create the project, setting its state to 'Pending' and linking to the creator.
            project = Project.objects.create(
                title=title,
                description=description,
                state=pending_state, # Assign the ProjectState object directly
                created_by=user,
                start_date=timezone.now().date().year # Assuming start_date is an IntegerField for year
            )
            
            # Attempt to create an automatic approval request.
            try:
                # Find the 'Department Head' role.
                dept_head_role = Role.objects.filter(type__icontains="Department Head").first()
                if dept_head_role:
                    # Find a user with the 'Department Head' role.
                    # This might need refinement to target a specific department head relevant to the project.
                    # For now, it picks the first one found.
                    dept_head_user_role = UserRoles.objects.filter(role=dept_head_role).first()
                    if dept_head_user_role:
                        # Create an ApprovalRequest for the new project.
                        ApprovalRequest.objects.create(
                            approval_type="project_proposal", # Use a valid choice from models.APPROVAL_TYPE_CHOICES
                            project=project,
                            requested_by=user,
                            current_approver=dept_head_user_role.user,
                            status="pending"
                        )
            except Exception as e:
                print(f"Approval request creation failed: {e}")

            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Project creation failed: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["patch", "put"])
    def update_project(self, request, pk=None):
        """
        Allows the project creator to update their project.
        """
        project = self.get_object()
        # Ensure only the creator can update the project.
        if project.created_by != request.user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Partial update is allowed (PATCH) or full update (PUT).
        serializer = self.get_serializer(project, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        # No need for else, serializer.is_valid(raise_exception=True) handles invalid data.

    @action(detail=True, methods=["delete"])
    def delete_project(self, request, pk=None):
        """
        Allows authorized users to delete a project.
        Authorization logic:
        - User has 'delete_project' permission.
        - User is the project creator.
        - User is an admin/dean and the project belongs to their college.
        """
        project = self.get_object()
        user = request.user
        user_can_delete = False

        # Check if user has explicit 'delete_project' permission.
        if PermissionManager.has_permission(user, "delete_project"):
            user_can_delete = True
        # Check if user is the creator of the project.
        elif project.created_by == user:
            user_can_delete = True
        # Check if user is an admin/dean and the project is within their college.
        elif PermissionManager.is_admin(user):
            # Get the user's academic affiliation to determine their college.
            user_affiliation = AcademicAffiliation.objects.filter(user=user).order_by("-start_date").first()
            if user_affiliation and user_affiliation.college:
                # Check if any group associated with the project belongs to the user's college.
                # Project -> Group -> ProgramGroup -> Program -> Department -> College
                # This is a complex traversal, simplified for direct project-to-college check if possible.
                # Assuming a project's groups are linked to departments, which are linked to colleges.
                if Group.objects.filter(
                    project=project,
                    programgroup__program__department__college=user_affiliation.college
                ).exists():
                    user_can_delete = True

        if not user_can_delete:
            return Response({"error": "Unauthorized - You do not have permission to delete this project"}, status=status.HTTP_403_FORBIDDEN)

        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================================================================
# 3. Dropdown Data API
#    Provides data for dropdowns in the frontend, filtered by user's affiliation.
# ==============================================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dropdown_data(request):
    """
    API endpoint to provide filtered lists of students, supervisors, and co-supervisors
    based on the requesting user's academic affiliation (department/college).
    """
    user = request.user
    
    # Get the most recent academic affiliation for the user.
    user_affiliation = AcademicAffiliation.objects.filter(user=user).order_by("-start_date").first()
    user_department = user_affiliation.department if user_affiliation else None
    user_college = user_affiliation.college if user_affiliation else None

    # --- Students Filtering ---
    # If the user is a student and has a department, filter students within that department.
    if PermissionManager.is_student(user) and user_department:
        # Get the 'Student' role object.
        student_role = Role.objects.filter(type="Student").first()
        students = User.objects.filter(
            userroles__role=student_role, 
            academicaffiliation__department=user_department
        ).exclude(id=user.id).distinct() if student_role else User.objects.none()
    else:
        # Otherwise, get all users with the 'Student' role (excluding the current user).
        students = User.objects.filter(userroles__role__type="Student").exclude(id=user.id).distinct()

    # --- Supervisors Filtering ---
    # If the user has a college, filter supervisors within that college.
    if user_college:
        # Get the 'Supervisor' role object.
        supervisor_role = Role.objects.filter(type="supervisor").first()
        supervisors = User.objects.filter(
            userroles__role=supervisor_role, 
            academicaffiliation__college=user_college
        ).distinct() if supervisor_role else User.objects.none()
    else:
        # Otherwise, get all users with the 'Supervisor' role.
        supervisors = User.objects.filter(userroles__role__type="supervisor").distinct()

    # --- Co-supervisors Filtering ---
    # If the user has a college, filter co-supervisors within that college.
    if user_college:
        # Get the 'Co-supervisor' role object.
        co_supervisor_role = Role.objects.filter(type="Co-supervisor").first()
        assistants = User.objects.filter(
            userroles__role=co_supervisor_role, 
            academicaffiliation__college=user_college
        ).distinct() if co_supervisor_role else User.objects.none()
    else:
        # Otherwise, get all users with the 'Co-supervisor' role.
        assistants = User.objects.filter(userroles__role__type="Co-supervisor").distinct()

    # Return the filtered lists of users.
    return Response({
        "students": [{"id": s.id, "name": s.name} for s in students],
        "supervisors": [{"id": sp.id, "name": sp.name} for sp in supervisors],
        "assistants": [{"id": a.id, "name": a.name} for a in assistants]
    })
