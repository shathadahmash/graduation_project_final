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

    # --- Custom Validations ---
    def validate(self, data):
        # 1. Check end_date > start_date
        start = data.get('start_date')
        end = data.get('end_date')
        if start and end and end <= start:
            raise serializers.ValidationError({
                "end_date": "سنة النهاية يجب أن تكون أكبر من سنة البداية"
            })
        
        # 2. Check duplicate project title
        title = data.get('title')
        project_id = self.instance.project_id if self.instance else None
        if Project.objects.filter(title=title).exclude(project_id=project_id).exists():
            raise serializers.ValidationError({
                "title": "تم تكرار اسم المشروع"
            })

        return data

    # --- SerializerMethodFields ---
    def get_supervisor_name(self, obj):
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
        for grp in getattr(obj, 'groups', []).all():
            for pg in getattr(grp, 'program_groups', []).all():
                prog = getattr(pg, 'program', None)
                if not prog: continue
                dept = getattr(prog, 'department', None)
                if not dept: continue
                college = getattr(dept, 'college', None)
                if college: return college.name_ar
        return None

    def get_university_name(self, obj):
        for grp in getattr(obj, 'groups', []).all():
            for pg in getattr(grp, 'program_groups', []).all():
                prog = getattr(pg, 'program', None)
                if not prog: continue
                dept = getattr(prog, 'department', None)
                if not dept: continue
                college = getattr(dept, 'college', None)
                if not college: continue
                branch = getattr(college, 'branch', None)
                if not branch: continue
                uni = getattr(branch, 'university', None)
                if uni: return uni.uname_ar
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