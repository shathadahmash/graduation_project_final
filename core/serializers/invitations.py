from rest_framework import serializers
from core.serializers.users import UserSerializer
from core.serializers.groups import GroupSerializer
from core.models import (
     GroupInvitation
)


class GroupInvitationSerializer(serializers.ModelSerializer):
    invited_student_detail = UserSerializer(source='invited_student', read_only=True)
    invited_by_detail = UserSerializer(source='invited_by', read_only=True)
    group_detail = GroupSerializer(source='group', read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupInvitation
        fields = [
            'invitation_id', 'group', 'group_detail', 'invited_student',
            'invited_student_detail', 'invited_by', 'invited_by_detail',
            'status', 'created_at', 'expires_at', 'responded_at', 'is_expired'
        ]
        read_only_fields = ['invitation_id', 'created_at', 'responded_at']
    
    def get_is_expired(self, obj):
        return obj.is_expired()


class CreateGroupInvitationSerializer(serializers.Serializer):
    group_id = serializers.IntegerField()
    student_ids = serializers.ListField(child=serializers.IntegerField())
    
    def validate_student_ids(self, value):
        if not value:
            raise serializers.ValidationError("يجب تحديد طالب واحد على الأقل")
        return value