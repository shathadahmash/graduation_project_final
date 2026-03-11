from rest_framework import serializers
from core.models import Project, University, College, Branch, ProjectState
from core.serializers.users import UserSerializer
from django.conf import settings


class ProjectSerializer(serializers.ModelSerializer):
    # Optional integer fields
    start_date = serializers.IntegerField(required=False, allow_null=True)
    end_date = serializers.IntegerField(required=False, allow_null=True)

    # Supervisor fields
    supervisor_name = serializers.SerializerMethodField()
    co_supervisor_name = serializers.SerializerMethodField()

    # IDs and names
    state_id = serializers.SerializerMethodField()
    state_name = serializers.SerializerMethodField()
    college_id = serializers.SerializerMethodField()
    college_name = serializers.SerializerMethodField()
    university_id = serializers.SerializerMethodField()
    university_name = serializers.SerializerMethodField()
    branch_id = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()

    # URLs
    logo_url = serializers.SerializerMethodField()
    documentation_url = serializers.SerializerMethodField()

    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'project_id', 'title', 'description', 'project_type',
            'state', 'state_id', 'state_name',
            'college_id', 'college_name',
            'university_id', 'university_name',
            'branch_id', 'branch_name',
            'start_date', 'end_date', 'field', 'tools',
            'logo', 'logo_url', 'documentation', 'documentation_url',
            'supervisor_name', 'co_supervisor_name', 'created_by'
        ]

    # --- Supervisor logic ---
    def get_supervisor_name(self, obj):
        groups = getattr(obj, 'groups', None)
        if not groups:
            return "لا يوجد مشرف"
        for grp in groups.all():
            supervisors = getattr(grp, 'groupsupervisors', None)
            if not supervisors:
                continue
            for gs in supervisors.all():
                if gs.type == 'supervisor' and gs.user:
                    return gs.user.name or gs.user.username
        return "لا يوجد مشرف"

    def get_co_supervisor_name(self, obj):
        groups = getattr(obj, 'groups', None)
        if not groups:
            return None
        for grp in groups.all():
            co_supervisors = getattr(grp, 'groupsupervisors', None)
            if not co_supervisors:
                continue
            for gs in co_supervisors.all():
                if gs.type == 'co_supervisor' and gs.user:
                    return gs.user.name or gs.user.username
        return None

    # --- IDs and names helpers ---
    def get_state_id(self, obj):
        return getattr(obj.state, 'ProjectStateId', None)

    def get_state_name(self, obj):
        return getattr(obj.state, 'name', None)

    def get_university_id(self, obj):
        return getattr(obj.university, 'uid', None)  # custom PK for University

    def get_university_name(self, obj):
        return getattr(obj.university, 'uname_ar', None)

    def get_college_id(self, obj):
        return getattr(obj.college, 'cid', None)  # custom PK for College

    def get_college_name(self, obj):
        return getattr(obj.college, 'name_ar', None)

    def get_branch_id(self, obj):
        return getattr(obj.branch, 'bid', None)  # replace 'bid' with actual PK if different

    def get_branch_name(self, obj):
        return getattr(obj.branch, 'name', None)

    # --- URLs ---
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return f"{settings.MEDIA_URL}{obj.logo}"
        return None

    def get_documentation_url(self, obj):
        if obj.documentation:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.documentation.url)
            return f"{settings.MEDIA_URL}{obj.documentation}"
        return None