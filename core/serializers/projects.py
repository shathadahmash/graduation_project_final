from rest_framework import serializers
from core.models import (
    GroupSupervisors,Project
)
from core.serializers.users import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.SerializerMethodField()
    co_supervisor_name = serializers.SerializerMethodField()
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
            'field',
            'tools',
            'Logo',
            'Documentation_Path',
            'co_supervisor_name',
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

    def get_co_supervisor_name(self, obj):
        rel = (
            GroupSupervisors.objects
            .filter(group__project=obj, type__in=['co_supervisor', 'co-supervisor', 'Co-supervisor', 'Co-supervisor'])
            .select_related('user')
            .first()
        )
        return rel.user.name if rel and rel.user else None

    def get_college_name(self, obj):
        # groups -> programgroup related_name is `program_groups` (bridge model)
        group = obj.groups.prefetch_related(
            'program_groups__program__department__college'
        ).first()
        if not group:
            return None

        pg = (
            group.program_groups
            .select_related('program__department__college')
            .first()
        )
        if pg and pg.program and getattr(pg.program, 'department', None) and getattr(pg.program.department, 'college', None):
            return pg.program.department.college.name_ar
        return None