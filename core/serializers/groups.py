from rest_framework import serializers
from core.serializers.users import UserSerializer
from core.models import (
    Group, GroupMembers, GroupSupervisors, GroupMemberApproval,GroupCreationRequest
)

class SupervisorGroupSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    project_type = serializers.CharField(source="project.type", read_only=True)
    members = serializers.SerializerMethodField()
    supervisors = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            "group_id",
            "group_name",
            "project_title",
            "project_type",
            "department",
            "members",
            "supervisors",
            "members_count",
        ]

    def get_members(self, obj):
        qs = GroupMembers.objects.filter(group=obj).select_related("user")
        return [m.user.name or m.user.username for m in qs]

    def get_supervisors(self, obj):
        qs = GroupSupervisors.objects.filter(group=obj).select_related("user")
        return [s.user.name or s.user.username for s in qs]

    def get_members_count(self, obj):
        return GroupMembers.objects.filter(group=obj).count()

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
        fields = ['group_id', 'group_name', 'project', 'department', 'members', 'supervisors', 'members_count']

    def get_members(self, obj):
        qs = GroupMembers.objects.filter(group=obj)
        return GroupMembersSerializer(qs, many=True).data

    def get_supervisors(self, obj):
        qs = GroupSupervisors.objects.filter(group=obj)
        return GroupSupervisorsSerializer(qs, many=True).data

    def get_members_count(self, obj):
        return GroupMembers.objects.filter(group=obj).count()


class GroupDetailSerializer(serializers.ModelSerializer):
    project_detail = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Group # سنستخدمه بشكل مرن
        fields = ['group_id', 'group_name', 'project_detail', 'members_count']

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
        fields = ['id', 'group_name', 'creator', 'approvals', 'is_fully_confirmed']