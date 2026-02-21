from rest_framework import serializers
from core.models import (
    GroupSupervisors,Project
)
from core.serializers.users import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name_ar', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    year = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'project_id', 'title', 'type', 'college', 'college_name', 'department', 'department_name',
            'supervisor_name', 'start_date', 'end_date', 'year', 'state', 'description', 'created_by'
        ]

    def get_year(self, obj):
        return obj.start_date.year if obj.start_date else None

    def get_supervisor_name(self, obj):
        rel = GroupSupervisors.objects.filter(group__project=obj, type='supervisor').select_related('user').first()
        if rel and rel.user:
            return rel.user.name
        return "لا يوجد مشرف"