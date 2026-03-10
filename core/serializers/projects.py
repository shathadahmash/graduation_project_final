from rest_framework import serializers
from core.models import Project, GroupSupervisors
from core.serializers.users import UserSerializer
from django.conf import settings

class ProjectSerializer(serializers.ModelSerializer):
    start_date = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=1900,
        max_value=2100
    )
    end_date = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=1900,
        max_value=2100
    )

    supervisor_name = serializers.SerializerMethodField()
    co_supervisor_name = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)
    college_name = serializers.SerializerMethodField()
    state_name = serializers.SerializerMethodField()
    university_name = serializers.SerializerMethodField()

    # New fields: return full URLs for logo and documentation
    logo_url = serializers.SerializerMethodField()
    documentation_url = serializers.SerializerMethodField()

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
            'logo',
            'logo_url',
            'documentation',
            'documentation_url',
            'co_supervisor_name',
            'supervisor_name',
            'created_by',
            'college_name',
            'university_name',
        ]

    def get_supervisor_name(self, obj):
        for grp in obj.groups.all():
            for gs in grp.groupsupervisors.all():
                if gs.type == 'supervisor' and gs.user:
                    return gs.user.name or gs.user.username
        return "لا يوجد مشرف"

    def get_co_supervisor_name(self, obj):
        for grp in obj.groups.all():
            for gs in grp.groupsupervisors.all():
                if gs.type == 'co_supervisor' and gs.user:
                    return gs.user.name or gs.user.username
        return None

    def get_college_name(self, obj):
        for grp in obj.groups.all():
            for pg in grp.program_groups.all():
                prog = pg.program
                if not prog:
                    continue
                dept = prog.department
                if not dept:
                    continue
                college = dept.college
                if college:
                    return college.name_ar
        return None

    def get_university_name(self, obj):
        for grp in obj.groups.all():
            for pg in grp.program_groups.all():
                prog = pg.program
                if not prog:
                    continue
                dept = prog.department
                if not dept:
                    continue
                college = dept.college
                if not college:
                    continue
                branch = college.branch
                if not branch:
                    continue
                uni = branch.university
                if uni:
                    return uni.uname_ar
        return None


    def get_state_name(self, obj):
        try:
            return obj.state.name if obj.state else None
        except Exception:
            return str(obj.state) if obj.state is not None else None

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