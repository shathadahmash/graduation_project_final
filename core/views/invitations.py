from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404


from core.models import (
 Group,GroupInvitation
)
from core.serializers import (
     GroupInvitationSerializer,CreateGroupInvitationSerializer
)

from core.permissions import PermissionManager

class GroupInvitationViewSet(viewsets.ModelViewSet):
    queryset = GroupInvitation.objects.all()
    serializer_class = GroupInvitationSerializer

    def get_queryset(self):
        user = self.request.user

        if PermissionManager.is_student(user):
            return GroupInvitation.objects.filter(invited_student=user)

        if PermissionManager.is_supervisor(user):
            return GroupInvitation.objects.filter(invited_by=user)

        return GroupInvitation.objects.none()

    def create(self, request, *args, **kwargs):
        """إرسال دعوات للطلاب"""
        serializer = CreateGroupInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group_id = serializer.validated_data['group_id']
        student_ids = serializer.validated_data['student_ids']

        group = get_object_or_404(Group, group_id=group_id)

        results = InvitationService.send_invitation(
            group=group,
            invited_student_ids=student_ids,
            invited_by=request.user
        )

        return Response(results, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """قبول الدعوة"""
        invitation = self.get_object()

        result = InvitationService.accept_invitation(invitation, request.user)
        return Response(result)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """رفض الدعوة"""
        invitation = self.get_object()

        result = InvitationService.reject_invitation(invitation, request.user)
        return Response(result)