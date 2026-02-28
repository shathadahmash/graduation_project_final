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
    state_name = serializers.SerializerMethodField()
    university_name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'project_id',
            'title',
            'description',
            'state',
            'state_name',
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
            'university_name',
        ]

    def get_supervisor_name(self, obj):
        # avoid hitting the DB by iterating over prefetched groups and supervisors
        for grp in getattr(obj, 'groups', []).all():
            for gs in getattr(grp, 'groupsupervisors_set', []).all():
                if gs.type == 'supervisor' and gs.user:
                    return gs.user.name or gs.user.username
        return "لا يوجد مشرف"

    def get_co_supervisor_name(self, obj):
        for grp in getattr(obj, 'groups', []).all():
            for gs in getattr(grp, 'groupsupervisors_set', []).all():
                if gs.type and gs.type.lower().startswith('co_supervisor') and gs.user:
                    return gs.user.name or gs.user.username
        return None

    def get_college_name(self, obj):
        # rely on groups prefetched in viewset
        for grp in getattr(obj, 'groups', []).all():
            for pg in getattr(grp, 'program_groups', []).all():
                prog = getattr(pg, 'program', None)
                if not prog:
                    continue
                dept = getattr(prog, 'department', None)
                if not dept:
                    continue
                college = getattr(dept, 'college', None)
                if college:
                    return college.name_ar
        return None

    def get_university_name(self, obj):
        # iterate over already-prefetched relationships to avoid additional queries
        for grp in getattr(obj, 'groups', []).all():
            for pg in getattr(grp, 'program_groups', []).all():
                prog = getattr(pg, 'program', None)
                if not prog:
                    continue
                dept = getattr(prog, 'department', None)
                if not dept:
                    continue
                college = getattr(dept, 'college', None)
                if not college:
                    continue
                branch = getattr(college, 'branch', None)
                if not branch:
                    continue
                uni = getattr(branch, 'university', None)
                if uni:
                    return uni.uname_ar
        return None

    def get_state_name(self, obj):
        try:
            return obj.state.name if obj.state else None
        except Exception:
            return str(obj.state) if obj.state is not None else None