from rest_framework import serializers
from core.models import Project
from core.serializers.users import UserSerializer
from django.conf import settings


class ProjectSerializer(serializers.ModelSerializer):

    # Optional integer fields
    start_date = serializers.IntegerField(required=False, allow_null=True)
    end_date = serializers.IntegerField(required=False, allow_null=True)

    # Supervisor fields
    supervisor_name = serializers.SerializerMethodField()
    co_supervisor_name = serializers.SerializerMethodField()

    # Groups (with members)
    groups = serializers.SerializerMethodField()

    # IDs (for filtering)
    state_id = serializers.IntegerField(source="state.ProjectStateId", read_only=True)
    college_id = serializers.IntegerField(read_only=True)
    university_id = serializers.IntegerField( read_only=True)
    branch_id = serializers.IntegerField( read_only=True)
    department_id = serializers.IntegerField( read_only=True)
    program_id = serializers.IntegerField(read_only=True)

    # Names (for frontend display)
    state_name = serializers.CharField(source="state.name", read_only=True)
    college_name = serializers.CharField(source="college.name_ar", read_only=True)
    university_name = serializers.CharField(source="university.uname_ar", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    program_name = serializers.CharField(source="program.p_name", read_only=True)

    # URLs
    logo_url = serializers.SerializerMethodField()
    documentation_url = serializers.SerializerMethodField()

    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            "project_id",
            "title",
            "description",
            "project_type",

            "state",
            "state_id",
            "state_name",

            "college_id",
            "college_name",

            "university_id",
            "university_name",

            "branch_id",
            "branch_name",

            "department_id",
            "department_name",

            "program_id",
            "program_name",

            "start_date",
            "end_date",
            "field",
            "tools",

            "logo",
            "logo_url",

            "documentation",
            "documentation_url",

            "supervisor_name",
            "co_supervisor_name",

            "groups",

            "created_by",
        ]

    # ---------------------------
    # Groups
    # ---------------------------
    def get_groups(self, obj):
        from core.serializers.groups import GroupSerializer

        groups = getattr(obj, "groups", None)
        if not groups:
            return []

        return GroupSerializer(
            groups.all(),
            many=True,
            context=self.context
        ).data

    # ---------------------------
    # Supervisor logic
    # ---------------------------
    def get_supervisor_name(self, obj):
        groups = getattr(obj, "groups", None)

        if not groups:
            return "لا يوجد مشرف"

        for grp in groups.all():
            supervisors = getattr(grp, "groupsupervisors", None)
            if not supervisors:
                continue

            for gs in supervisors.all():
                if gs.type == "supervisor" and gs.user:
                    return gs.user.name or gs.user.username

        return "لا يوجد مشرف"

    def get_co_supervisor_name(self, obj):
        groups = getattr(obj, "groups", None)

        if not groups:
            return None

        for grp in groups.all():
            supervisors = getattr(grp, "groupsupervisors", None)
            if not supervisors:
                continue

            for gs in supervisors.all():
                if gs.type == "co_supervisor" and gs.user:
                    return gs.user.name or gs.user.username

        return None

    # ---------------------------
    # File URLs
    # ---------------------------
    def get_logo_url(self, obj):
        if not obj.logo:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.logo.url)

        return f"{settings.MEDIA_URL}{obj.logo}"

    def get_documentation_url(self, obj):
        if not obj.documentation:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.documentation.url)

        return f"{settings.MEDIA_URL}{obj.documentation}"