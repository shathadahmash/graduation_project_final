from rest_framework import serializers
from core.serializers.users import UserSerializer
from rest_framework import serializers
from core.models import programgroup
from .location import ProgramSerializer
from .projects import ProjectSerializer
from core.models import (
    Group, GroupMembers, GroupSupervisors, GroupMemberApproval,GroupCreationRequest
)

class SupervisorGroupSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    members = serializers.SerializerMethodField()
    supervisors = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    group_type = serializers.SerializerMethodField()
    programs = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            "group_id",
            "project_title",
            "programs",
            "members",
            "supervisors",
            "members_count",
            "group_type",
        ]

    def get_members(self, obj):
        qs = GroupMembers.objects.filter(group=obj).select_related("user")
        return [m.user.name or m.user.username for m in qs]

    def get_supervisors(self, obj):
        qs = GroupSupervisors.objects.filter(group=obj).select_related("user")
        return [s.user.name or s.user.username for s in qs]

    def get_members_count(self, obj):
        return obj.groupmembers_set.count()

    def get_programs(self, obj):
        return GroupProgramSerializer(
            obj.programs.all(), many=True
        ).data

    def get_group_type(self, obj):
        program_links = obj.programs.select_related(
            'program__department__college__branch__university'
        )

        universities, colleges, departments, programs = set(), set(), set(), set()

        for link in program_links:
            p = link.program
            if not p:
                continue

            programs.add(p.id)
            departments.add(p.department_id)
            colleges.add(p.department.college_id)
            universities.add(p.department.college.branch.university_id)

        if len(universities) > 1:
            return 'multi_university'
        if len(colleges) > 1:
            return 'multi_college'
        if len(departments) > 1:
            return 'multi_department'
        if len(programs) > 1:
            return 'multi_program'
        return 'single_program'

   

class GroupMembersSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = GroupMembers
        fields = ['user', 'user_detail', 'group']


class GroupSupervisorsSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)

    class Meta:
        model = GroupSupervisors
        fields = ['user', 'user_detail', 'group', 'type']


class GroupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    supervisors = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['group_id', 'project', 'members', 'supervisors', 'members_count']

    def get_members(self, obj):
        qs = GroupMembers.objects.filter(group=obj).select_related('user')
        return GroupMembersSerializer(qs, many=True).data

    def get_supervisors(self, obj):
        qs = GroupSupervisors.objects.filter(group=obj).select_related('user')
        return GroupSupervisorsSerializer(qs, many=True).data

    def get_members_count(self, obj):
        return obj.groupmembers_set.count()


class GroupDetailSerializer(serializers.ModelSerializer):
    project_detail = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Group # سنستخدمه بشكل مرن
        fields = ['group_id', 'project_detail', 'members_count']

    def get_project_detail(self, obj):
        # التأكد من وجود مشروع سواء في الطلب أو المجموعة الرسمية
        project = getattr(obj, 'project', None)
        if project:
            return {
                'project_id': project.project_id,
                'title': project.title,
                'state': getattr(project, 'state', 'N/A'),
            }
        return None

    def get_members_count(self, obj):
        # إذا كان مجموعة رسمية نعد من جدول GroupMembers
        if hasattr(obj, 'groupmembers_set'):
            return obj.groupmembers_set.count()
        # إذا كان طلب إنشاء نعد من جدول Approvals
        if hasattr(obj, 'approvals'):
            return obj.approvals.count()
        return 0

class GroupMemberStatusSerializer(serializers.ModelSerializer):
    # جلب الاسم من موديل الـ User المرتبط
    name = serializers.ReadOnlyField(source='user.name') 
    
    # الـ role والـ status سيتم جلبهما تلقائياً من موديل GroupMemberApproval
    # ولكن للتأكد من وصول القيم النصية (student, supervisor) وليس الـ ID
    role = serializers.CharField(read_only=True)
    status = serializers.CharField()

    class Meta:
        model = GroupMemberApproval
        fields = ['id', 'user', 'name', 'role', 'status']


class GroupDetailSerializer(serializers.ModelSerializer):
    # 'approvals' هو الحقل الذي يبحث عنه الـ React الآن
    approvals = GroupMemberStatusSerializer(many=True, read_only=True)

    class Meta:
     
        model = GroupCreationRequest
        fields = ['id', 'creator', 'approvals', 'is_fully_confirmed']


class GroupProgramSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.p_name', read_only=True)
    department_name = serializers.CharField(source='program.department.name', read_only=True)
    college_name = serializers.CharField(source='program.department.college.name_ar', read_only=True)
    branch_name = serializers.SerializerMethodField()
    university_name = serializers.CharField(source='program.department.college.branch.university.name_ar', read_only=True)

    class Meta:
        model = programgroup
        fields = ['program_name', 'department_name', 'college_name', 'branch_name', 'university_name']

    def get_branch_name(self, obj):
        # safe traversal
        try:
            return obj.program.department.college.branch.city.bname_ar
        except AttributeError:
            return None
        


class GroupProjectDetailSerializer(serializers.ModelSerializer):
    project_detail = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['group_id', 'project_detail', 'members_count']

    def get_project_detail(self, obj):
        if obj.project:
            return {
                'project_id': obj.project.project_id,
                'title': obj.project.title,
                'state': str(obj.project.state),
            }
        return None

    def get_members_count(self, obj):
        return obj.groupmembers_set.count()
