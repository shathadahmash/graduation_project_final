from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.utils.html import format_html
from django.forms import ClearableFileInput
from .models import (
    City, University, Branch, College, Department,
    ProgressStage, ProgressSubStage, ProgressPattern, PatternStageAssignment, PatternSubStageAssignment,
    CollegeProgressPattern, DepartmentProgressPattern, Program, StudentProgress,
    User, ContactUs, ProjectState, Project, programgroup, Group, Notification, AcademicAffiliation,
    GroupMembers, GroupSupervisors, Role, Permission, RolePermission, UserRoles,
    Staff,
    GroupInvitation, ApprovalRequest, NotificationLog, SystemSettings, ApprovalSequence,
    GroupCreationRequest, GroupMemberApproval,Student, StudentEnrollmentPeriod,CompanyType, Sector, ExternalCompany
)

# ============================================================================== 
# Admin Site Customization
# ==============================================================================
admin.site.site_header = "Advanced Project Management Admin"
admin.site.site_title = "Project Management Portal"
admin.site.index_title = "Welcome to the Project Management Administration"

# ============================================================================== 
# Inlines for better UX
# ==============================================================================
class PatternStageAssignmentInline(admin.TabularInline):
    model = PatternStageAssignment
    extra = 1
    autocomplete_fields = ('stage',)

class PatternSubStageAssignmentInline(admin.TabularInline):
    model = PatternSubStageAssignment
    extra = 1
    autocomplete_fields = ('sub_stage',)

class CollegeProgressPatternInline(admin.TabularInline):
    model = CollegeProgressPattern
    extra = 1
    autocomplete_fields = ('pattern',)

class DepartmentProgressPatternInline(admin.TabularInline):
    model = DepartmentProgressPattern
    extra = 1
    autocomplete_fields = ('pattern',)

class GroupMembersInline(admin.TabularInline):
    model = GroupMembers
    extra = 1
    autocomplete_fields = ('user',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            from .models import User
            kwargs['queryset'] = User.objects.filter(userroles__role__type__iexact='student').distinct()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class GroupSupervisorsInline(admin.TabularInline):
    model = GroupSupervisors
    extra = 1
    autocomplete_fields = ('user',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            from .models import User
            # supervisors can be any user; show all users but keep autocomplete
            kwargs['queryset'] = User.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1
    autocomplete_fields = ('permission',)

class UserRolesInline(admin.TabularInline):
    model = UserRoles
    extra = 1
    autocomplete_fields = ('role',)

class GroupInvitationInline(admin.TabularInline):
    model = GroupInvitation
    extra = 0
    autocomplete_fields = ('invited_student', 'invited_by', 'group')
    readonly_fields = ('created_at', 'expires_at', 'responded_at', 'status')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        from .models import User
        if db_field.name == 'invited_student':
            kwargs['queryset'] = User.objects.filter(userroles__role__type__iexact='student').distinct()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class GroupMemberApprovalInline(admin.TabularInline):
    model = GroupMemberApproval
    extra = 0
    autocomplete_fields = ('user',)
    readonly_fields = ('responded_at', 'status')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            from .models import User
            kwargs['queryset'] = User.objects.filter(userroles__role__type__iexact='student').distinct()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

# ============================================================================== 
# Model Admins
# ==============================================================================

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('bid', 'bname_ar', 'bname_en')
    search_fields = ('bname_ar', 'bname_en')
    list_filter = ('bname_ar',)

try:
    admin.site.unregister(University)
except admin.sites.NotRegistered:
    pass

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('uid', 'uname_ar', 'uname_en', 'type', 'image_preview')
    search_fields = ('uname_ar', 'uname_en', 'type')
    list_filter = ('type',)
    fields = ('uname_ar', 'uname_en', 'type', 'image')  # include image in admin form

    # Custom upload widget for image field
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'image':
            kwargs['widget'] = ClearableFileInput(attrs={'class': 'file-upload'})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    # Show clickable thumbnail in list_display
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" style="height:50px;" /></a>',
                obj.image.url,
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Logo'

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('ubid', 'university', 'city', 'location', 'address', 'contact')
    list_filter = ('university', 'city')
    search_fields = ('university__uname_ar', 'city__bname_ar', 'location', 'address', 'contact')
    autocomplete_fields = ('university', 'city')


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('cid', 'name_ar', 'name_en', 'branch', 'image_preview')
    list_filter = ('branch__university', 'branch__city')
    search_fields = ('name_ar', 'name_en', 'branch__university__uname_ar', 'branch__city__bname_ar')
    autocomplete_fields = ('branch',)
    inlines = [CollegeProgressPatternInline]

    # Include image in the admin form
    fields = ('name_ar', 'name_en', 'branch', 'image')

    # Customize file upload widget
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'image':
            kwargs['widget'] = ClearableFileInput(attrs={'class': 'file-upload'})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    # Show image preview in list_display
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;" />', obj.image.url)
        return '-'
    image_preview.short_description = 'Logo'


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_id', 'name', 'college')
    list_filter = ('college__branch__university', 'college')
    search_fields = ('name', 'college__name_ar')
    autocomplete_fields = ('college',)
    inlines = [DepartmentProgressPatternInline]

@admin.register(ProgressStage)
class ProgressStageAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(ProgressSubStage)
class ProgressSubStageAdmin(admin.ModelAdmin):
    list_display = ('stage', 'name', 'order', 'max_mark')
    list_filter = ('stage',)
    search_fields = ('name', 'stage__name')
    autocomplete_fields = ('stage',)

@admin.register(ProgressPattern)
class ProgressPatternAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
    inlines = [PatternStageAssignmentInline]

@admin.register(PatternStageAssignment)
class PatternStageAssignmentAdmin(admin.ModelAdmin):
    list_display = ('pattern', 'stage', 'order', 'max_mark')
    list_filter = ('pattern', 'stage')
    search_fields = ('pattern__name', 'stage__name')
    autocomplete_fields = ('pattern', 'stage')
    inlines = [PatternSubStageAssignmentInline]

@admin.register(PatternSubStageAssignment)
class PatternSubStageAssignmentAdmin(admin.ModelAdmin):
    list_display = ('pattern_stage_assignment', 'sub_stage', 'order', 'max_mark')
    list_filter = ('pattern_stage_assignment__pattern', 'sub_stage__stage')
    search_fields = ('pattern_stage_assignment__pattern__name', 'sub_stage__name')
    autocomplete_fields = ('pattern_stage_assignment', 'sub_stage')

@admin.register(CollegeProgressPattern)
class CollegeProgressPatternAdmin(admin.ModelAdmin):
    list_display = ('college', 'pattern', 'is_default', 'assigned_at')
    list_filter = ('college', 'pattern', 'is_default')
    search_fields = ('college__name_ar', 'pattern__name')
    autocomplete_fields = ('college', 'pattern')
    readonly_fields = ('assigned_at',)

@admin.register(DepartmentProgressPattern)
class DepartmentProgressPatternAdmin(admin.ModelAdmin):
    list_display = ('department', 'pattern', 'is_default', 'assigned_at')
    list_filter = ('department', 'pattern', 'is_default')
    search_fields = ('department__name', 'pattern__name')
    autocomplete_fields = ('department', 'pattern')
    readonly_fields = ('assigned_at',)

@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('pid', 'p_name', 'department')
    list_filter = ('department__college', 'department')
    search_fields = ('p_name', 'department__name')
    autocomplete_fields = ('department',)

@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'group', 'pattern_stage_assignment', 'sub_stage_assignment', 'score', 'updated_at')
    list_filter = ('group', 'pattern_stage_assignment__stage', 'sub_stage_assignment__sub_stage')
    search_fields = (
        'student__username', 'student__name', 'group__project__title', 
        'pattern_stage_assignment__stage__name', 'sub_stage_assignment__sub_stage__name'
    )
    autocomplete_fields = ('student', 'group', 'pattern_stage_assignment', 'sub_stage_assignment')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('student', 'group', ('pattern_stage_assignment', 'sub_stage_assignment'))
        }),
        (_('Progress Details'), {
            'fields': ('score', 'notes')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'student':
            from .models import User
            kwargs['queryset'] = User.objects.filter(userroles__role__type__iexact='student').distinct()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # الأعمدة الظاهرة في قائمة المستخدمين
    list_display = (
        'username',
        'CID',
        'email',
        'name',
        'phone',
        'gender',
        'is_staff',
        'is_active',
    )

    # البحث
    search_fields = ('username', 'CID', 'email', 'name', 'phone')

    # الفلاتر
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'gender')

    # إضافة الحقول في صفحة التعديل
    fieldsets = UserAdmin.fieldsets + (
        (_('Additional Info'), {
            'fields': ('CID', 'phone', 'name', 'gender')
        }),
    )

    # إضافة الحقول في صفحة الإضافة
    add_fieldsets = UserAdmin.add_fieldsets + (
        (_('Additional Info'), {
            'fields': ('CID', 'phone', 'name', 'gender')
        }),
    )

    inlines = [UserRolesInline]

@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'created_at', 'user')
    list_filter = ('created_at',)
    search_fields = ('first_name', 'last_name', 'email', 'message', 'user__username')
    readonly_fields = ('created_at',)
    autocomplete_fields = ('user',)

@admin.register(ProjectState)
class ProjectStateAdmin(admin.ModelAdmin):
    list_display = ('ProjectStateId', 'name')
    search_fields = ('name',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'project_id', 'title', 'project_type', 'state', 'university', 'branch', 'college',
        'created_by', 'start_date', 'end_date', 'field', 'tools', 'logo_preview', 'documentation_link'
    )
    list_filter = ('project_type', 'state', 'start_date', 'end_date')
    search_fields = (
        'title', 'description', 'field', 'tools', 'created_by__username',
        'university__uname_ar', 'branch__university__uname_ar', 'branch__city__bname_ar',
        'college__name_ar'
    )
    autocomplete_fields = ('created_by', 'state', 'university', 'branch', 'college')

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'state', 'created_by', 'project_type')
        }),
        (_('Project Timeline'), {
            'fields': ('start_date', 'end_date')
        }),
        (_('Additional Info'), {
            'fields': ('field', 'tools', 'logo', 'documentation'),
        }),
    )

    # Custom upload widgets for files
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name in ['logo', 'documentation']:
            kwargs['widget'] = ClearableFileInput(attrs={'class': 'file-upload'})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    # Clickable thumbnail preview for project logo
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" style="height:50px;" /></a>',
                obj.logo.url,
                obj.logo.url
            )
        return '-'
    logo_preview.short_description = 'Logo'

    # Clickable link for project documentation
    def documentation_link(self, obj):
        if obj.documentation:
            return format_html('<a href="{}" target="_blank">View</a>', obj.documentation.url)
        return '-'
    documentation_link.short_description = 'Documentation'

    @admin.display(description='University')
    def university_name(self, obj):
        # delegate to model property which already aggregates names
        return obj.university_name or 'N/A'


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('staff_id', 'user', 'role', 'Qualification', 'Office_Hours')
    search_fields = ('user__username', 'user__name', 'role__type')
    autocomplete_fields = ('user', 'role')

@admin.register(programgroup)
class ProgramGroupAdmin(admin.ModelAdmin):
    list_display = ('program', 'group')
    list_filter = ('program', 'group')
    search_fields = ('program__p_name', 'group__project__title')
    autocomplete_fields = ('program', 'group')

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('group_id', 'get_project_title', 'academic_year', 'pattern', 'project', 'created_at')
    list_filter = ('academic_year', 'pattern', 'project')
    search_fields = ('project__title', 'academic_year', 'pattern__name')
    autocomplete_fields = ('pattern', 'project')
    readonly_fields = ('created_at',)
    inlines = [GroupMembersInline, GroupSupervisorsInline, GroupInvitationInline]
    
    @admin.display(description='Project Title', ordering='project__title')
    def get_project_title(self, obj):
        return obj.project.title if obj.project else "No Project Assigned"

    fieldsets = (
        (None, {
            'fields': ('academic_year', 'pattern', 'project')
        }),
        (_('Timestamps'), {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('not_ID', 'user', 'message', 'state', 'date')
    list_filter = ('state', 'date')
    search_fields = ('user__username', 'message', 'state')
    autocomplete_fields = ('user',)
    readonly_fields = ('date',)
    date_hierarchy = 'date'

@admin.register(AcademicAffiliation)
class AcademicAffiliationAdmin(admin.ModelAdmin):
    list_display = ('affiliation_id', 'user', 'university', 'college', 'department', 'start_date', 'end_date')
    list_filter = ('university', 'college', 'department', 'start_date', 'end_date')
    search_fields = (
        'user__username', 'university__uname_ar', 'college__name_ar', 'department__name'
    )
    autocomplete_fields = ('user', 'university', 'college', 'department')
    date_hierarchy = 'start_date'

@admin.register(GroupMembers)
class GroupMembersAdmin(admin.ModelAdmin):
    list_display = ('user', 'group')
    list_filter = ('group',)
    search_fields = ('user__username', 'group__project__title')
    autocomplete_fields = ('user', 'group')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            from .models import User
            kwargs['queryset'] = User.objects.filter(userroles__role__type__iexact='student').distinct()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(GroupSupervisors)
class GroupSupervisorsAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'type')
    list_filter = ('type', 'group')
    search_fields = ('user__username', 'group__project__title', 'type')
    autocomplete_fields = ('user', 'group')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'user':
            from .models import User
            kwargs['queryset'] = User.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_ID', 'type', 'role_type')
    search_fields = ('type', 'role_type')
    inlines = [RolePermissionInline]

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('perm_ID', 'name', 'Description')
    search_fields = ('name', 'Description')

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission')
    list_filter = ('role', 'permission')
    search_fields = ('role__type', 'permission__name')
    autocomplete_fields = ('role', 'permission')

@admin.register(UserRoles)
class UserRolesAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)
    search_fields = ('user__username', 'role__type')
    autocomplete_fields = ('user', 'role')

@admin.register(GroupInvitation)
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ('invitation_id', 'group', 'invited_student', 'invited_by', 'status', 'created_at', 'expires_at', 'responded_at')
    list_filter = ('status', 'created_at', 'expires_at', 'group', 'invited_student')
    search_fields = (
        'group__project__title', 'invited_student__username', 'invited_by__username', 'status'
    )
    autocomplete_fields = ('group', 'invited_student', 'invited_by')
    readonly_fields = ('created_at', 'expires_at', 'responded_at')
    date_hierarchy = 'created_at'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        from .models import User
        if db_field.name == 'invited_student':
            kwargs['queryset'] = User.objects.filter(userroles__role__type__iexact='student').distinct()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ('approval_id', 'approval_type', 'group', 'project', 'requested_by', 'current_approver', 'status', 'created_at')
    list_filter = ('approval_type', 'status', 'created_at', 'requested_by', 'current_approver')
    search_fields = (
        'approval_type', 'group__project__title', 'project__title', 
        'requested_by__username', 'current_approver__username', 'comments'
    )
    autocomplete_fields = ('group', 'project', 'requested_by', 'current_approver')
    readonly_fields = ('created_at', 'updated_at', 'approved_at')
    date_hierarchy = 'created_at'
    fieldsets = (
        (None, {
            'fields': ('approval_type', ('group', 'project'), ('requested_by', 'current_approver'))
        }),
        (_('Approval Status'), {
            'fields': ('status', 'approval_level', 'comments')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at', 'approved_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('notification_id', 'recipient', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = (
        'recipient__username', 'title', 'message', 'related_group__project__title', 
        'related_project__title', 'related_user__username'
    )
    autocomplete_fields = ('recipient', 'related_group', 'related_project', 'related_user', 'related_approval')
    readonly_fields = ('created_at', 'read_at')
    date_hierarchy = 'created_at'
    actions = ['mark_as_read']

    @admin.action(description='Mark selected notifications as read')
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(request, f"{queryset.count()} notifications marked as read.")

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ('setting_key', 'setting_value', 'description', 'updated_at')
    search_fields = ('setting_key', 'setting_value', 'description')
    readonly_fields = ('updated_at',)

@admin.register(ApprovalSequence)
class ApprovalSequenceAdmin(admin.ModelAdmin):
    list_display = ('sequence_id', 'sequence_type', 'description', 'group', 'project')
    list_filter = ('sequence_type',)
    search_fields = ('sequence_type', 'description', 'group__project__title', 'project__title')
    autocomplete_fields = ('group', 'project')
    fieldsets = (
        (None, {
            'fields': ('sequence_type', 'description')
        }),
        (_('Associated Entities'), {
            'fields': ('group', 'project')
        }),
        (_('Approval Levels (JSON)'), {
            'fields': ('approval_levels',),
            'description': 'Define approval levels as a JSON array, e.g., ["Department Head", "Dean"]'
        }),
    )

@admin.register(GroupCreationRequest)
class GroupCreationRequestAdmin(admin.ModelAdmin):
    list_display = ( 'creator', 'department_id', 'college_id', 'is_fully_confirmed', 'created_at')
    list_filter = ('is_fully_confirmed', 'created_at')
    search_fields = ( 'creator__username', 'note')
    autocomplete_fields = ('creator',)
    readonly_fields = ('created_at', 'is_fully_confirmed')
    inlines = [GroupMemberApprovalInline]
    date_hierarchy = 'created_at'

@admin.register(GroupMemberApproval)
class GroupMemberApprovalAdmin(admin.ModelAdmin):
    list_display = ('request', 'user', 'role', 'status', 'responded_at')
    list_filter = ('status', 'role')
    search_fields = ( 'user__username', 'role', 'status')
    autocomplete_fields = ('request', 'user')
    readonly_fields = ('responded_at',)
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'user', 'university', 'college', 'department', 'program', 'status', 'phone','current_academic_year_display')
    search_fields = ('student_id', 'user__username', 'user__name')
    list_filter = ('status', 'university', 'college', 'department', 'program')

    # دالة لتظهر السنة الدراسية الحالية
    @admin.display(description='Current Academic Year')
    def current_academic_year_display(self, obj):
        return obj.current_academic_year()
    
@admin.register(StudentEnrollmentPeriod)
class StudentEnrollmentPeriodAdmin(admin.ModelAdmin):
    list_display = ('student', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date')
    search_fields = ('student__user__name',)

# ===============================
# CompanyType
# ===============================
@admin.register(CompanyType)
class CompanyTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

# ===============================
# Sector
# ===============================
@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('sector_id', 'name')
    search_fields = ('name',)
# ===============================
# ExternalCompany
# ===============================
@admin.register(ExternalCompany)
class ExternalCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'company_type', 'sector', 'contact_email', 'contact_phone', 'created_by', 'created_at')
    list_filter = ('company_type', 'sector', 'created_at')
    search_fields = ('name', 'description', 'contact_email', 'contact_phone', 'created_by__name')
