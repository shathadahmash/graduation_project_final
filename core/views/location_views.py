from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import University
from core.serializers.location import UniversitySerializer

from core.models import Program
from core.serializers.location import ProgramSerializer


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


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only list/retrieve for programs used by frontend import form."""
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset().order_by('p_name')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
