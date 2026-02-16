from rest_framework import serializers
import json
from django.utils import timezone
from .models import (
    City, University, Branch, College, Department, Program,
    User, Role, UserRoles, Permission, RolePermission,
    Group, GroupMembers, GroupSupervisors,
    Project, GroupInvitation, ApprovalRequest,
    NotificationLog, Notification,
    GroupCreationRequest, AcademicAffiliation, GroupMemberApproval
)


# ==============================================================================
# 1. Serializers الموقع الجغرافي (Cities / Universities / Branches / Colleges)
# ==============================================================================

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['bid', 'bname_ar', 'bname_en']


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['uid', 'uname_ar', 'uname_en', 'type']


class BranchSerializer(serializers.ModelSerializer):
    university_detail = UniversitySerializer(source='university', read_only=True)
    city_detail = CitySerializer(source='city', read_only=True)

    class Meta:
        model = Branch
        fields = [
            'ubid',
            'university', 'university_detail',
            'city', 'city_detail',
            'location', 'address', 'contact'
        ]


class CollegeSerializer(serializers.ModelSerializer):
    branch_detail = BranchSerializer(source='branch', read_only=True)

    class Meta:
        model = College
        fields = [
            'cid', 'name_ar', 'name_en', 'branch', 'branch_detail'
        ]


class DepartmentSerializer(serializers.ModelSerializer):
    college_detail = CollegeSerializer(source='college', read_only=True)

    class Meta:
        model = Department
        fields = [
            'department_id', 'name', 'description', 'college', 'college_detail'
        ]


class ProgramSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)

    class Meta:
        model = Program
        fields = ['pid', 'p_name', 'department', 'department_detail']


# ==============================================================================
# 2. Serializers المستخدمين
# ==============================================================================

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    department_id = serializers.SerializerMethodField()
    college_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'phone', 'gender', 'roles', 'department_id', 'college_id']

    def get_roles(self, obj):
        return list(UserRoles.objects.filter(user=obj).values('role__role_ID', 'role__type'))

    def get_department_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.department.id if affiliation and affiliation.department else None

    def get_college_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.college.id if affiliation and affiliation.college else None


class UserDetailSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['company_name', 'date_joined']


class AcademicAffiliationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    college = CollegeSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = AcademicAffiliation
        fields = '__all__'


# ==============================================================================
# 3. Serializers المجموعات
# ==============================================================================
from .models import Group, GroupMembers, GroupSupervisors

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



# ==============================================================================
# 4. Serializers الدعوات
# ==============================================================================

class GroupInvitationSerializer(serializers.ModelSerializer):
    invited_student_detail = UserSerializer(source='invited_student', read_only=True)
    invited_by_detail = UserSerializer(source='invited_by', read_only=True)
    group_detail = GroupSerializer(source='group', read_only=True)
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupInvitation
        fields = [
            'invitation_id', 'group', 'group_detail', 'invited_student',
            'invited_student_detail', 'invited_by', 'invited_by_detail',
            'status', 'created_at', 'expires_at', 'responded_at', 'is_expired'
        ]
        read_only_fields = ['invitation_id', 'created_at', 'responded_at']
    
    def get_is_expired(self, obj):
        return obj.is_expired()


class CreateGroupInvitationSerializer(serializers.Serializer):
    group_id = serializers.IntegerField()
    student_ids = serializers.ListField(child=serializers.IntegerField())
    
    def validate_student_ids(self, value):
        if not value:
            raise serializers.ValidationError("يجب تحديد طالب واحد على الأقل")
        return value


# ==============================================================================
# 5. Serializers المشاريع
# ==============================================================================

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


# ==============================================================================
# 6. Serializers الموافقات
# ==============================================================================

class ApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by_detail = UserSerializer(source='requested_by', read_only=True)
    current_approver_detail = UserSerializer(source='current_approver', read_only=True)
    group_detail = GroupSerializer(source='group', read_only=True)
    
    class Meta:
        model = ApprovalRequest
        fields = [
            'approval_id', 'approval_type', 'group', 'group_detail', 'project',
            'requested_by', 'requested_by_detail', 'current_approver',
            'current_approver_detail', 'approval_level', 'status', 'comments',
            'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = ['approval_id', 'created_at', 'updated_at', 'approved_at']



# ==============================================================================
# 7. Serializers إنشاء المجموعات
# ==============================================================================

class GroupCreateSerializer(serializers.Serializer):
    # حقول المجموعة
    group_name = serializers.CharField(max_length=255)
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
    supervisor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    co_supervisor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    department_id = serializers.IntegerField(required=True)
    college_id = serializers.IntegerField(required=True)
    note = serializers.CharField(required=False, allow_blank=True, default='')

    # حقول المشروع (تم دمجها من النسخة الأولى)
    project_title = serializers.CharField(max_length=500)
    project_type = serializers.CharField(max_length=100)
    project_description = serializers.CharField()

    def validate(self, data):
        MAX_STUDENTS, MAX_SUPERVISORS, MAX_CO_SUPERVISORS = 5, 3, 2
        
        # التحقق من الأعداد
        if len(data['student_ids']) > MAX_STUDENTS:
            raise serializers.ValidationError(f"الحد الأقصى للطلاب هو {MAX_STUDENTS}")
        if len(data.get('supervisor_ids', [])) > MAX_SUPERVISORS:
            raise serializers.ValidationError(f"الحد الأقصى للمشرفين هو {MAX_SUPERVISORS}")
        if len(data.get('co_supervisor_ids', [])) > MAX_CO_SUPERVISORS:
            raise serializers.ValidationError(f"الحد الأقصى للمشرفين المساعدين هو {MAX_CO_SUPERVISORS}")

        # التحقق من عدم التكرار والوجود
        all_ids = data['student_ids'] + data.get('supervisor_ids', []) + data.get('co_supervisor_ids', [])
        if len(all_ids) != len(set(all_ids)):
            raise serializers.ValidationError("يجب أن تكون قائمة الأعضاء والمشرفين فريدة")
            
        if User.objects.filter(id__in=all_ids).count() != len(all_ids):
            raise serializers.ValidationError("بعض معرفات المستخدمين غير صحيحة")

        # التحقق من القسم والكلية
        try:
            Department.objects.get(department_id=data['department_id'])
            College.objects.get(cid=data['college_id'])
        except (Department.DoesNotExist, College.DoesNotExist):
            raise serializers.ValidationError("القسم أو الكلية غير صالحة")

        # التحقق من أن المنشئ ضمن الطلاب
        request = self.context.get('request')
        if request and request.user.id not in data['student_ids']:
            raise serializers.ValidationError("يجب أن يكون الطالب المنشئ ضمن قائمة الطلاب")

        return data
    

    def create(self, validated_data):
        from django.db import transaction
        from django.utils import timezone
        import json
        from .models import (
            Project, GroupCreationRequest, GroupMemberApproval, 
            NotificationLog, ApprovalRequest, Department, College
        )
        
        requested_by = self.context['request'].user

        with transaction.atomic():
            # 1. إنشاء المشروع أولاً
            project = Project.objects.create(
                title=validated_data['project_title'],
                type=validated_data['project_type'],
                description=validated_data['project_description'],
                start_date=timezone.now().date(),
                state='Pending Approval'
            )

            # 2. إنشاء طلب المجموعة الرئيسي مرتبطاً بالمشروع
            group_request = GroupCreationRequest.objects.create(
                group_name=validated_data['group_name'],
                creator=requested_by,
                department_id=validated_data['department_id'],
                college_id=validated_data['college_id'],
                project=project,  # ربط المشروع بطلب المجموعة
                note=validated_data.get('note', '')
            )

            # 3. معالجة المشاركين (طلاب، مشرفين، مساعدين)
            participants = []
            for s_id in validated_data.get('student_ids', []): participants.append({'id': s_id, 'role': 'student'})
            for s_id in validated_data.get('supervisor_ids', []): participants.append({'id': s_id, 'role': 'supervisor'})
            for s_id in validated_data.get('co_supervisor_ids', []): participants.append({'id': s_id, 'role': 'co_supervisor'})

            for person in participants:
                p_id = int(person['id'])
                is_creator = (p_id == requested_by.id)
                
                # إنشاء سجل العضوية والموافقة
                member_status = GroupMemberApproval.objects.create(
                    request=group_request,
                    user_id=p_id,
                    role=person['role'],
                    status='accepted' if is_creator else 'pending'
                )

                # إرسال إشعار دعوة للبقية
                if not is_creator:
                    NotificationLog.objects.create(
                        recipient_id=p_id,
                        notification_type='invitation',
                        title='دعوة انضمام للمجموعة',
                        message=f'قام {requested_by.name} بدعوتك لمجموعة {group_request.group_name}',
                        related_id=member_status.id 
                    )

            # 4. إنشاء طلب الاعتماد الرسمي (ApprovalRequest) لربط العملية بالنظام الإداري
            # يتم تخزين بيانات المجموعة في حقل comments كنسخة احتياطية
            group_summary = {
                'group_name': validated_data['group_name'],
                'student_ids': validated_data['student_ids'],
                'department_id': validated_data['department_id'],
            }
            
            ApprovalRequest.objects.create(
                approval_type='project_proposal',
                project=project,
                requested_by=requested_by,
                current_approver=None, # يتم تحديده لاحقاً بناءً على سير العمل
                comments=json.dumps(group_summary),
                status='pending'
            )

            return group_request


# ==============================================================================
# 8. Serializers الإشعارات
# ==============================================================================

class NotificationLogSerializer(serializers.ModelSerializer):
    # الحقل الآن مخزن كرقم مباشرة في قاعدة البيانات
    # سنعرضه كما هو لكي يستخدمه React فوراً
    status = serializers.SerializerMethodField()

    class Meta:
        model = NotificationLog
        fields = [
            'notification_id', 
            'notification_type', 
            'title', 
            'message', 
            'is_read', 
            'status', 
            'related_id',  # هذا الحقل الآن يحمل ID الموافقة الفردية مباشرة
            'created_at'
        ]

    def get_status(self, obj):
        return 'read' if obj.is_read else 'unread'
    

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'


# ==============================================================================
# 9. Serializers الأدوار والصلاحيات
# ==============================================================================

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_ID', 'type', 'role_type']

    def validate_type(self, value):
        # Prevent duplicate role names (case-insensitive)
        qs = Role.objects.filter(type__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("دور بنفس الاسم موجود بالفعل")
        return value


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['perm_ID', 'name', 'Description']


class RolePermissionSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    permission_detail = PermissionSerializer(source='permission', read_only=True)

    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'role_detail', 'permission', 'permission_detail']


class UserRolesSerializer(serializers.ModelSerializer):
    user_detail = serializers.StringRelatedField(source='user', read_only=True)
    role_detail = RoleSerializer(source='role', read_only=True)

    class Meta:
        model = UserRoles
        fields = ['id', 'user', 'user_detail', 'role', 'ROLE_CHOICES', 'role_detail']



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
        from .models import GroupCreationRequest
        model = GroupCreationRequest
        fields = ['id', 'group_name', 'creator', 'approvals', 'is_fully_confirmed']