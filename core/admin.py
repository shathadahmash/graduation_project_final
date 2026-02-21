# core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    City, University, Branch, College, Department, Program,
    User, Project, Group, Notification, AcademicAffiliation,
    GroupMembers, GroupSupervisors, Role, Permission, RolePermission,
    UserRoles, GroupInvitation, ApprovalRequest, NotificationLog,
    SystemSettings, ApprovalSequence , ProgressStage,
    ProgressPattern,
    PatternStageAssignment,
    CollegeProgressPattern,
    DepartmentProgressPattern,ProgressSubStage, PatternSubStageAssignment, StudentProgress,
    GroupCreationRequest, GroupMemberApproval,ContactUs
)


# Ensure registration of remaining models
from .models import ProjectState, programProject

# ============================================================================== 
# 1. إدارة مراحل التقدم (ProgressStage)
# ============================================================================== 
@admin.register(ProgressStage)
class ProgressStageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description')
    search_fields = ('name', 'description')


# ============================================================================== 
# 2. إدارة أنماط التقدم (ProgressPattern) مع Inline للمراحل
# ============================================================================== 
class PatternStageAssignmentInline(admin.TabularInline):
    model = PatternStageAssignment
    extra = 1
    ordering = ('order',)
    fields = ('stage', 'order', 'max_mark')


@admin.register(ProgressPattern)
class ProgressPatternAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    inlines = [PatternStageAssignmentInline]  # Use inline instead of filter_horizontal


# ============================================================================== 
# 3. إدارة ربط الأنماط بالمراحل (PatternStageAssignment)
# ============================================================================== 
@admin.register(PatternStageAssignment)
class PatternStageAssignmentAdmin(admin.ModelAdmin):
    list_display = ('pattern', 'stage', 'order', 'max_mark')
    list_filter = ('pattern',)
    search_fields = ('pattern__name', 'stage__name')


@admin.register(ProgressSubStage)
class ProgressSubStageAdmin(admin.ModelAdmin):
    list_display = ('id', 'stage', 'name', 'order', 'max_mark')
    list_filter = ('stage',)
    search_fields = ('name', 'stage__name')


@admin.register(PatternSubStageAssignment)
class PatternSubStageAssignmentAdmin(admin.ModelAdmin):
    list_display = ('pattern_stage_assignment', 'sub_stage', 'order', 'max_mark')
    list_filter = ('pattern_stage_assignment__pattern',)
    search_fields = ('pattern_stage_assignment__pattern__name', 'sub_stage__name')


# ============================================================================== 
# 4. إدارة أنماط التقدم الخاصة بالكليات (CollegeProgressPattern)
# ============================================================================== 
@admin.register(CollegeProgressPattern)
class CollegeProgressPatternAdmin(admin.ModelAdmin):
    list_display = ('college', 'pattern', 'is_default', 'assigned_at')
    list_filter = ('college', 'is_default')
    search_fields = ('college__name_ar', 'pattern__name')


# ============================================================================== 
# 5. إدارة أنماط التقدم الخاصة بالأقسام (DepartmentProgressPattern)
# ============================================================================== 
@admin.register(DepartmentProgressPattern)
class DepartmentProgressPatternAdmin(admin.ModelAdmin):
    list_display = ('department', 'pattern', 'is_default', 'assigned_at')
    list_filter = ('department', 'is_default')
    search_fields = ('department__name', 'pattern__name')

# ==============================================================================
# 1. إدارة المستخدمين
# ==============================================================================
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'name', 'email', 'phone', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'name', 'email', 'phone')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('إضافات مخصصة', {'fields': ('phone', 'company_name', 'name', 'gender')}),
    )


# ==============================================================================
# 2. إدارة الموقع الجغرافي
# ==============================================================================
@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('bid', 'bname_ar', 'bname_en')
    search_fields = ('bname_ar', 'bname_en')


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('uid', 'uname_ar', 'uname_en', 'type')
    search_fields = ('uname_ar', 'uname_en')


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('ubid', 'university', 'city', 'location')
    list_filter = ('university', 'city')
    search_fields = ('location', 'address')


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('cid', 'name_ar', 'branch')
    list_filter = ('branch',)
    search_fields = ('name_ar', 'name_en')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_id', 'name', 'college')
    list_filter = ('college',)
    search_fields = ('name',)


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('pid', 'p_name', 'department')
    list_filter = ('department',)
    search_fields = ('p_name',)


# ==============================================================================
# 3. إدارة الأدوار والصلاحيات
# ==============================================================================
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_ID', 'type', 'role_type')
    search_fields = ('type', 'role_type')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('perm_ID', 'name')
    search_fields = ('name',)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission')
    list_filter = ('role',)


@admin.register(UserRoles)
class UserRolesAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username',)


# ==============================================================================
# 4. إدارة المشاريع والمجموعات
# ==============================================================================
# ==============================================================================
# 4. إدارة المشاريع والمجموعات
# ==============================================================================
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'title', 'state', 'created_by', 'start_date', 'end_date')
    list_filter = ('state', 'start_date')
    search_fields = ('title', 'description', 'created_by__username')
    readonly_fields = ('project_id',)
    ordering = ('-start_date',)
    list_select_related = ('state', 'created_by')
    list_per_page = 25
    list_editable = ('state',)

    fieldsets = (
        ('Metadata', {
            'fields': ('created_by',)
        }),
        ('Basic Info', {
            'fields': ('title', 'description', 'state')
        }),
        ('التواريخ', {
            'fields': ('start_date', 'end_date')
        }),
    )

    def get_college_name(self, obj):
        return obj.college.name_ar if obj.college else "غير مرتبط بكلية"
    get_college_name.short_description = 'الكلية'
    get_college_name.admin_order_field = 'college__name_ar'
    
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('group_id', 'group_name', 'academic_year', 'pattern', 'project', 'created_at')
    list_filter = ('academic_year', 'pattern', 'created_at')
    search_fields = ('group_name', 'project__title')
    fieldsets = (
        ('Basic Information', {
            'fields': ('group_name', 'academic_year')
        }),
        ('Academic', {
            'fields': ('pattern',)
        }),
        ('Project Assignment', {
            'fields': ('project',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at',)
    raw_id_fields = ('project',)
    autocomplete_fields = ('pattern',)

    class GroupMembersInline(admin.TabularInline):
        model = GroupMembers
        extra = 0
        autocomplete_fields = ('user',)

    class GroupSupervisorsInline(admin.TabularInline):
        model = GroupSupervisors
        extra = 0
        autocomplete_fields = ('user',)

    inlines = [GroupMembersInline, GroupSupervisorsInline]




@admin.register(GroupMembers)
class GroupMembersAdmin(admin.ModelAdmin):
    list_display = ('user', 'group')
    list_filter = ('group',)
    search_fields = ('user__username', 'group__group_name')


@admin.register(GroupSupervisors)
class GroupSupervisorsAdmin(admin.ModelAdmin):
    list_display = ('user', 'group')
    list_filter = ('group',)
    search_fields = ('user__username', 'group__group_name')


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'group', 'pattern_stage_assignment', 'sub_stage_assignment', 'score', 'updated_at')
    list_filter = ('group', 'pattern_stage_assignment__pattern')
    search_fields = ('student__username', 'group__group_name')
    readonly_fields = ('updated_at', 'created_at')


@admin.register(GroupCreationRequest)
class GroupCreationRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'group_name', 'creator', 'is_fully_confirmed', 'created_at')
    list_filter = ('is_fully_confirmed', 'created_at')
    search_fields = ('group_name', 'creator__username')


@admin.register(GroupMemberApproval)
class GroupMemberApprovalAdmin(admin.ModelAdmin):
    list_display = ('request', 'user', 'role', 'status', 'responded_at')
    list_filter = ('role', 'status')
    search_fields = ('user__username', 'request__group_name')


# ==============================================================================
# 5. إدارة الدعوات والموافقات والإشعارات
# ==============================================================================
@admin.register(GroupInvitation)
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ('invitation_id', 'group', 'invited_student', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('invited_student__username', 'group__group_name')
    readonly_fields = ('created_at', 'responded_at')


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ('approval_id', 'approval_type', 'status', 'approval_level', 'created_at')
    list_filter = ('approval_type', 'status', 'approval_level')
    search_fields = ('group__group_name', 'project__title')
    readonly_fields = ('created_at', 'updated_at', 'approved_at')


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('notification_id', 'recipient', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('not_ID', 'user', 'state', 'date')
    list_filter = ('state', 'date')
    search_fields = ('user__username', 'message')
    readonly_fields = ('date',)


# ==============================================================================
# 6. إدارة الإعدادات والتسلسلات
# ==============================================================================
@admin.register(AcademicAffiliation)
class AcademicAffiliationAdmin(admin.ModelAdmin):
    list_display = ('affiliation_id', 'user', 'university', 'college', 'department', 'start_date')
    list_filter = ('university', 'college', 'department', 'start_date')
    search_fields = ('user__username', 'college__name_ar', 'department__name')
    
    # لترتيب وتوضيح النموذج داخل صفحة الإضافة/التعديل
    fieldsets = (
        ('معلومات المستخدم', {
            'fields': ('user',)
        }),
        ('البيانات الأكاديمية', {
            'fields': ('university', 'college', 'department')
        }),
        ('المدة الزمنية', {
            'fields': ('start_date', 'end_date')
        }),
    )


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('setting_key', 'setting_value', 'updated_at')
    search_fields = ('setting_key',)
    readonly_fields = ('updated_at',)


@admin.register(ApprovalSequence)
class ApprovalSequenceAdmin(admin.ModelAdmin):
    list_display = ('sequence_id', 'sequence_type', 'approval_levels')
    search_fields = ('sequence_type',)


@admin.register(ProjectState)
class ProjectStateAdmin(admin.ModelAdmin):
    list_display = ('ProjectStateId', 'name')
    search_fields = ('name',)


@admin.register(programProject)
class ProgramProjectAdmin(admin.ModelAdmin):
    list_display = ('program', 'project')
    search_fields = ('program__p_name', 'project__title')


# CONNECT US
@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_name', 'email', 'user', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('first_name', 'last_name', 'email', 'message', 'user__username')
    readonly_fields = ('created_at', 'user')
    ordering = ('-created_at',)
    list_per_page = 25

    fieldsets = (
        ('User Info', {
            'fields': ('user', 'first_name', 'last_name', 'email')
        }),
        ('Message', {
            'fields': ('message',)
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )

    def get_name(self, obj):
        # Show full name or "Guest" if not provided
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return "Guest"
    get_name.short_description = "Name"

