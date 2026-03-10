from rest_framework import viewsets
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework import viewsets
from core.models import Branch, College, Department, University,City
from core.serializers.location import BranchSerializer, CollegeSerializer, DepartmentSerializer, UniversitySerializer,CitySerializer

from core.models import Program,University,Department,College
from core.serializers.location import ProgramSerializer
# Add this near the top with your imports
from rest_framework.permissions import BasePermission
from core.permissions import PermissionManager

# -------------------------------------------------------------------
# Custom DRF Permission for creating departments
# -------------------------------------------------------------------
class CanCreateDepartment(BasePermission):
    """
    Allow creating a department only if user has 'create_department' permission
    via PermissionManager.
    """
    def has_permission(self, request, view):
        # Only enforce for 'create' action
        if view.action == 'create':
            return PermissionManager.has_permission(request.user, 'create_department')
        return True

class UniversityViewSet(viewsets.ModelViewSet):
    """Simple CRUD for University used by frontend list/create."""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().order_by('uname_ar')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class ProgramViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """
    Full CRUD for programs used by frontend import form.
    Supports list, retrieve, create, update, and delete.
    """
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        List programs ordered by name
        """
        qs = self.get_queryset().order_by('p_name')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    

class CollegeProgramsView(APIView):
    """Helper endpoint returning programs for a specific college id."""
    permission_classes = [IsAuthenticated]

    def get(self, request, college_id, *args, **kwargs):
        qs = Program.objects.filter(department__college_id=college_id).order_by('p_name')
        serializer = ProgramSerializer(qs, many=True)
        return Response(serializer.data)


class CollegeViewSet(viewsets.ModelViewSet):
    """Simple CRUD for College used by frontend list/create."""
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().order_by('name_ar')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='departments')
    def departments(self, request, pk=None):
        """Fetch departments for a specific college."""
        college = self.get_object()
        qs = Department.objects.filter(college=college).order_by('name')
        serializer = DepartmentSerializer(qs, many=True)
        return Response(serializer.data)
class DepartmentViewSet(viewsets.ModelViewSet):
    """Simple CRUD for Department used by frontend list/create."""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    # Add our custom permission
    permission_classes = [IsAuthenticated, CanCreateDepartment]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().order_by('name')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Optional: extra manual check, ensures 403 with proper message
        if not PermissionManager.has_permission(request.user, 'create_department'):
            return Response(
                {"detail": "ليس لديك صلاحية إنشاء قسم"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve cities
    """
    queryset = City.objects.all()
    serializer_class = CitySerializer



class BranchViewSet(viewsets.ModelViewSet):
    """Simple CRUD for Branch used by frontend list/create."""  
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer 
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().order_by('city')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CollegeDepartmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, college_id, *args, **kwargs):
        qs = Department.objects.filter(college_id=college_id).order_by('name')
        serializer = DepartmentSerializer(qs, many=True)
        return Response(serializer.data)



class CollegeProgramsView(APIView):
    """Return programs for a specific college id."""
    permission_classes = [IsAuthenticated]

    def get(self, request, college_id, *args, **kwargs):
        qs = Program.objects.filter(department__college_id=college_id).order_by('p_name')
        serializer = ProgramSerializer(qs, many=True)
        return Response(serializer.data)

class universitycollegeviewset(viewsets.ModelViewSet):
    """Simple CRUD for University used by frontend list/create."""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().order_by('uname_ar')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FetchRelatedToUniversity(viewsets.ModelViewSet):
    """
    ViewSet to fetch all branches, colleges, departments, and programs
    related to a specific university.
    """
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """
        GET /fetch-related-to-university/<pk>/related/
        """
        try:
            university = self.get_object()
        except University.DoesNotExist:
            return Response(
                {'detail': 'University not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch branches of the university with related colleges/departments/programs
        branches = Branch.objects.filter(university=university).prefetch_related(
            'college_set__department_set__program_set'
        )

        branch_serializer = BranchSerializer(branches, many=True, context={'request': request})
        university_serializer = UniversitySerializer(university, context={'request': request})

        return Response({
            'university': university_serializer.data,
            'branches': branch_serializer.data
        })
