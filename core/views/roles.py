from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import (
   Role, UserRoles
)
from core.serializers.users import (
    RoleSerializer,UserRolesSerializer 
)




# ============================================================================================
# 11. UserRoles (assign/remove roles to users)
# ============================================================================================

class UserRolesViewSet(viewsets.ModelViewSet):
    queryset = UserRoles.objects.all()
    serializer_class = UserRolesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Accept either {user: id, role: id} or {user_id, role_id}
        data = request.data
        user_id = data.get('user') or data.get('user_id')
        role_id = data.get('role') or data.get('role_id')
        if not user_id or not role_id:
            return Response({'detail': 'user and role are required'}, status=400)
        # prevent duplicates
        obj, created = UserRoles.objects.get_or_create(user_id=user_id, role_id=role_id)
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=201 if created else 200)

    def destroy(self, request, *args, **kwargs):
        # support delete by query params ?user_id=&role_id=
        user_id = request.query_params.get('user') or request.query_params.get('user_id')
        role_id = request.query_params.get('role') or request.query_params.get('role_id')
        if user_id and role_id:
            qs = UserRoles.objects.filter(user_id=user_id, role_id=role_id)
            deleted, _ = qs.delete()
            if deleted:
                return Response(status=204)
            return Response({'detail': 'not found'}, status=404)
        return super().destroy(request, *args, **kwargs)


# ============================================================================================
# 8. Roles
# ============================================================================================

class RoleViewSet(viewsets.ModelViewSet):
    """Allow viewing and management of roles. Creation/update/deletion require authentication."""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]