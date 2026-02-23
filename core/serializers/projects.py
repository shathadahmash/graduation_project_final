from rest_framework import serializers
from core.models import (
    GroupSupervisors,Project
)
from core.serializers.users import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)
    college_name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'project_id',
            'title',
            'description',
            'state',
            'start_date',
            'end_date',
            'supervisor_name',
            'created_by',
            'college_name',
        ]

    def get_supervisor_name(self, obj):
        rel = (
            GroupSupervisors.objects
            .filter(group__project=obj, type='supervisor')
            .select_related('user')
            .first()
        )
        return rel.user.name if rel and rel.user else "لا يوجد مشرف"

    def get_college_name(self, obj):
        group = obj.groups.select_related(
            'programs__program__department__college'
        ).first()
        if group and group.programs.exists():
            return group.programs.first().program.department.college.name_ar
        return None