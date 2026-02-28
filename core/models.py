from django.db import models, transaction
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
from django.conf import settings

# ============================================================================== 
# 1. نموذج المدينة (City)
# ==============================================================================
class City(models.Model):
    bid = models.AutoField(primary_key=True)
    bname_ar = models.CharField(max_length=255)
    bname_en = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.bname_ar

    class Meta:
        verbose_name_plural = "Cities"

# ============================================================================== 
# 2. النماذج الأساسية للموقع الجغرافي
# ==============================================================================
class University(models.Model):
    uid = models.AutoField(primary_key=True)
    uname_ar = models.CharField(max_length=255)
    uname_en = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.uname_ar

    class Meta:
        verbose_name_plural = "Universities"

class Branch(models.Model):
    ubid = models.AutoField(primary_key=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    location = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    contact = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.university.uname_ar} - {self.city.bname_ar} Branch"

    class Meta:
        verbose_name_plural = "Branches"
        unique_together = ('university', 'city')


class College(models.Model):
    cid = models.AutoField(primary_key=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True)
    name_ar = models.CharField(max_length=255)
    name_en = models.CharField(max_length=255, blank=True, null=True)

    # Many-to-many relationship handled via CollegeProgressPattern intermediate table

    def __str__(self):
        return f"{self.name_ar} - {self.branch}"

    class Meta:
        verbose_name_plural = "Colleges"

class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    college = models.ForeignKey(College, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    # Many-to-many relationship handled via DepartmentProgressPattern intermediate table

    def __str__(self):
        return f"{self.name} - {self.college.name_ar}"

    class Meta:
        verbose_name_plural = "Departments"




class ProgressStage(models.Model):
    """
    A generic stage definition (e.g., 'Proposal', 'Midterm', 'Final').
    """
    name = models.CharField(max_length=255, unique=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class ProgressSubStage(models.Model):
    """
    Represents a sub-stage within a ProgressStage.
    Example: Stage = 'Proposal', Sub-stages = 'Initial Draft', 'Peer Review', 'Final Draft'
    """
    stage = models.ForeignKey(
        ProgressStage, 
        on_delete=models.CASCADE, 
        related_name='sub_stages'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    max_mark = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = ('stage', 'name')

    def __str__(self):
        return f"{self.stage.name} -> {self.name} (Order: {self.order})"


class ProgressPattern(models.Model):
    """
    A pattern of stages for progress tracking.
    """
    name = models.CharField(max_length=255)
    stages = models.ManyToManyField(
        ProgressStage, 
        through='PatternStageAssignment',
        related_name='patterns'
    )

    def __str__(self):
        return self.name


class PatternStageAssignment(models.Model):
    """
    The 'Bridge' table connecting Patterns and Stages.
    Also allows assigning specific settings for stages and sub-stages.
    """
    pattern = models.ForeignKey(ProgressPattern, on_delete=models.CASCADE)
    stage = models.ForeignKey(ProgressStage, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    max_mark = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = [
            ('pattern', 'stage'),
            ('pattern', 'order'),
        ]

    def __str__(self):
        return f"{self.pattern.name} -> {self.stage.name} (Order: {self.order})"


class PatternSubStageAssignment(models.Model):
    """
    Assign settings to sub-stages for a specific pattern.
    """
    pattern_stage_assignment = models.ForeignKey(
        PatternStageAssignment, 
        on_delete=models.CASCADE, 
        related_name='sub_stage_assignments'
    )
    sub_stage = models.ForeignKey(
        ProgressSubStage, 
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()
    max_mark = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['order']
        unique_together = [
            ('pattern_stage_assignment', 'sub_stage'),
            ('pattern_stage_assignment', 'order'),
        ]

    def __str__(self):
        return f"{self.pattern_stage_assignment} -> {self.sub_stage.name} (Order: {self.order})"



class CollegeProgressPattern(models.Model):
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='college_patterns')
    pattern = models.ForeignKey('ProgressPattern', on_delete=models.CASCADE, related_name='college_patterns')
    is_default = models.BooleanField(default=False, help_text="Marks this pattern as default for the college")
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('college', 'pattern')
        verbose_name_plural = "College Progress Patterns"

    def __str__(self):
        return f"{self.college.name_ar} - {self.pattern.name}"

    
class DepartmentProgressPattern(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='department_patterns')
    pattern = models.ForeignKey('ProgressPattern', on_delete=models.CASCADE, related_name='department_patterns')
    is_default = models.BooleanField(default=False, help_text="Marks this pattern as default for the department")
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('department', 'pattern')
        verbose_name_plural = "Department Progress Patterns"

    def __str__(self):
        return f"{self.department.name} - {self.pattern.name}"


class Program(models.Model):
    pid = models.AutoField(primary_key=True)
    p_name = models.CharField(max_length=255)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.p_name} ({self.department.name})"

    class Meta:
        verbose_name_plural = "Programs"

class StudentProgress(models.Model):
    student = models.ForeignKey('User', on_delete=models.CASCADE, related_name='progress_records')
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='student_progress')
    pattern_stage_assignment = models.ForeignKey(
        'PatternStageAssignment', 
        on_delete=models.CASCADE, 
        related_name='student_progress'
    )
    sub_stage_assignment = models.ForeignKey(
        'PatternSubStageAssignment',
        on_delete=models.CASCADE,
        related_name='student_progress',
        blank=True, null=True
    )
    score = models.FloatField(blank=True, null=True, help_text="Teacher-assigned score")
    notes = models.TextField(blank=True, null=True, help_text="Teacher or student notes")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'group', 'pattern_stage_assignment', 'sub_stage_assignment')
        verbose_name_plural = "Student Progress Records"

    def __str__(self):
        stage_name = self.pattern_stage_assignment.stage.name
        sub_stage_name = self.sub_stage_assignment.sub_stage.name if self.sub_stage_assignment else "Main Stage"
        return f"{self.student.name} - {stage_name} ({sub_stage_name})"


# ============================================================================== 
# 3. نموذج المستخدم المخصص
# ==============================================================================
class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    gender = models.CharField(
        max_length=10,
        choices=[('Male','Male'),('Female','Female'),('Other','Other')],
        blank=True, null=True
    )

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name or self.username


# ============================================================================== 
# 4. تواصل معنا
# ==============================================================================

class ContactUs(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='contact_messages'
    )
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'

    def __str__(self):
        return f"Message from {self.first_name or 'Guest'} {self.last_name or ''} ({self.email or 'No Email'})"
# ============================================================================== 
# 4. المشاريع والمجموعات والإشعارات
# ==============================================================================


class ProjectState(models.Model):
    ProjectStateId = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)  
    # ('Completed','مكتمل'),('Incomplete','غير مكتمل'),('Reserved','محجوز'),('Accepted','مقبول')
    def __str__(self):
        return self.name



class Project(models.Model):
    # STATE_CHOICES = [('Completed','مكتمل'),('Incomplete','غير مكتمل'),('Reserved','محجوز'),('Accepted','مقبول'),('Rejected','مرفوض'),('Pending','معلق')]
    state  = models.ForeignKey(
        ProjectState,
        on_delete=models.PROTECT,
        related_name='projects',
    )
    field = models.TextField( blank=True, null=True)
    tools = models.TextField(blank=True, null=True)
    project_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    description = models.TextField()
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_projects')
    # adding the year and removing start_date and end_date to simplify filtering and sorting by year
    start_date = models.IntegerField(("Start Year"), null=True, blank=True)
    end_date = models.IntegerField(("End Year"), null=True, blank=True)
    Logo = models.TextField("Logo", blank=True, null=True)
    Documentation_Path = models.TextField("Documentation Path", blank=True, null=True)
    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Projects"

    def get_university_names(self):
        """Return a comma-separated list of universities associated through groups/programs.

        The relationship path is:
            Project -> Group (via related_name 'groups')
                    -> ProgramGroup -> Program -> Department -> College -> Branch -> University
        """
        universities = set()
        # iterate through all groups related to this project
        for grp in self.groups.all():
            # each group may be linked to multiple programs via programgroup
            for pg in grp.program_groups.all():
                dept = getattr(pg.program, 'department', None)
                if not dept:
                    continue
                college = getattr(dept, 'college', None)
                if not college:
                    continue
                branch = getattr(college, 'branch', None)
                if not branch or not branch.university:
                    continue
                universities.add(branch.university.uname_ar)
        return ", ".join(universities)

    @property
    def university_name(self):
        """Convenience property used in admin display.
        """
        return self.get_university_names()

    def get_university(self):
        """Return the first University instance linked through groups/programs, or None."""
        # similar traversal as get_university_names but returning model
        for grp in self.groups.all():
            for pg in grp.program_groups.all():
                dept = getattr(pg.program, 'department', None)
                if not dept:
                    continue
                college = getattr(dept, 'college', None)
                if not college:
                    continue
                branch = getattr(college, 'branch', None)
                if branch and branch.university:
                    return branch.university
        return None

class Staff(models.Model):
    staff_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='staff_profiles')
    role = models.ForeignKey('Role', verbose_name=("Role"), on_delete=models.CASCADE)
    Qualification = models.TextField(blank=True, null=True)
    Office_Hours = models.TextField(blank=True, null=True)
    def __str__(self):
        return f"{self.user.name} - {self.role.type if self.role else 'No Role'}"
    

class programgroup(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='program_groups')
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='program_groups')

    class Meta:
        unique_together = ('program', 'group')
        verbose_name_plural = "Program Groups"

class Group(models.Model):
    group_id = models.AutoField(primary_key=True)
    academic_year = models.CharField(max_length=9, null=True)
    # النمط الذي تختاره المجموعة (يجب أن يكون من أنماط القسم الخاص بالبرنامج)
    pattern = models.ForeignKey(
        'ProgressPattern',
       on_delete=models.PROTECT,
       null=True,
       blank=True,
       related_name='groups'
    )

    # الارتباط بالمشروع (تم تصحيح استدعاء الحقل في دالة __str__)
    project = models.ForeignKey(
        'Project',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='groups'
    )

    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        # تصحيح: استخدام self.project.title بدلاً من project_name
        pat_name = self.pattern.name if self.pattern else 'No Pattern'
        proj_title = self.project.title if self.project else 'No Project'
        
        return f" {pat_name} - {proj_title}"

    def clean(self):
        """
        التأكد من أن النمط المختار ضمن أنماط القسم الخاص بالبرنامج
        """
        from django.core.exceptions import ValidationError

        # if self.pattern and self.program:
        #     department = self.program.department
        #     # الحصول على قائمة معرفات الأنماط المسموح بها لهذا القسم
        #     allowed_patterns = department.department_patterns.values_list('pattern_id', flat=True)
            
        #     if self.pattern.id not in allowed_patterns:
        #         raise ValidationError("The selected pattern must belong to the program's department.")


class Notification(models.Model):
    not_ID = models.AutoField(primary_key=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    message = models.TextField()
    state = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.state}"

    class Meta:
        verbose_name_plural = "Notifications"

class AcademicAffiliation(models.Model):
    affiliation_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    college = models.ForeignKey(College, on_delete=models.CASCADE, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.university.uname_ar}"

    class Meta:
        unique_together = ('user', 'university', 'start_date')
        verbose_name_plural = "Academic Affiliations"

class GroupMembers(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)

    def __str__(self):
        return f"Member {self.user.username} in the group with the project {self.group.project.title if self.group.project else 'No Project'}"

    class Meta:
        unique_together = ('user', 'group')
        verbose_name_plural = "Group Members"

class GroupSupervisors(models.Model):
    SUPERVISOR_TYPE_CHOICES = [('supervisor','مشرف'),('co_supervisor','مشرف مشارك')]
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=SUPERVISOR_TYPE_CHOICES, default='supervisor')

    def __str__(self):
        proj_title = self.group.project.title if self.group.project else 'No Project'
        return f"{self.get_type_display()} {self.user.username} for Group with the project name  {proj_title}"

    class Meta:
        unique_together = ('user', 'group')
        verbose_name_plural = "Group Supervisors"

# ============================================================================== 
# 5. الأدوار والصلاحيات
# ==============================================================================
class Role(models.Model):
    role_ID = models.AutoField(primary_key=True)
    type = models.CharField(max_length=100)
    role_type = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.type

class Permission(models.Model):
    perm_ID = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    Description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('role', 'permission')
        verbose_name_plural = "Role Permissions"

class UserRoles(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'role')
        verbose_name_plural = "User Roles"

# ============================================================================== 
# 6. نظام الدعوات والموافقات
# ==============================================================================
def default_expiry():
    return timezone.now() + timedelta(hours=48)

class GroupInvitation(models.Model):
    INVITATION_STATUS_CHOICES = [('pending','قيد الانتظار'),('accepted','مقبولة'),('rejected','مرفوضة'),('expired','انتهت صلاحيتها')]
    invitation_id = models.AutoField(primary_key=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='invitations')
    invited_student = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_invitations')
    invited_by = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_invitations')
    status = models.CharField(max_length=20, choices=INVITATION_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiry)
    responded_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Invitation to {self.invited_student.username} for {self.group.group_name}"

    class Meta:
        verbose_name_plural = "Group Invitations"
        unique_together = ('group', 'invited_student')

    def is_expired(self):
        return timezone.now() > self.expires_at and self.status == 'pending'

class ApprovalRequest(models.Model):
    APPROVAL_STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('approved', 'موافق عليه'),
        ('rejected', 'مرفوض'),
        ('returned', 'مرجع للتعديل'),
    ]

    APPROVAL_TYPE_CHOICES = [
        ('project_proposal', 'مقترح مشروع'),
        ('student_transfer', 'نقل طالب'),
        ('group_transfer', 'نقل مجموعة'),
        ('external_project', 'مشروع خارجي'),
        ('co_supervisor', 'مشرف مشارك'),
    ]

    approval_id = models.AutoField(primary_key=True)
    approval_type = models.CharField(max_length=50, choices=APPROVAL_TYPE_CHOICES,null=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='approval_requests', blank=True, null=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='approval_requests', blank=True, null=True)

    requested_by = models.ForeignKey('User', on_delete=models.CASCADE, related_name='approval_requests_created')
    current_approver = models.ForeignKey('User', on_delete=models.CASCADE, related_name='pending_approvals',null=True)
    approval_level = models.IntegerField(default=1)

    status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending')
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_approval_type_display()} - {self.get_status_display()}"

    class Meta:
        verbose_name_plural = "Approval Requests"
        ordering = ['-created_at']



class NotificationLog(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('invitation', 'دعوة مجموعة'),
        ('approval', 'موافقة/رفض'),
        ('rejection', 'رفض'),
        ('transfer', 'نقل'),
        ('reminder', 'تذكير'),
        ('system', 'إشعار نظام'),
        ('message', 'رسالة'),
    ]

    notification_id = models.AutoField(primary_key=True)
    recipient = models.ForeignKey('User', on_delete=models.CASCADE, related_name='notifications',null=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES, null=True)
    title = models.CharField(max_length=255)
    message = models.TextField()

    related_group = models.ForeignKey('Group', on_delete=models.SET_NULL, blank=True, null=True)
    related_project = models.ForeignKey('Project', on_delete=models.SET_NULL, blank=True, null=True)
    related_user = models.ForeignKey('User', on_delete=models.SET_NULL, blank=True, null=True, related_name='notifications_about_user')
    related_id = models.IntegerField(null=True, blank=True)   
    is_read = models.BooleanField(default=False)
    is_sent_email = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)
    related_approval = models.ForeignKey(
        'ApprovalRequest',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.recipient.username}"

    class Meta:
        verbose_name_plural = "Notification Logs"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['is_read', 'recipient']),
        ]
# ============================================================================== 
# 7. إعدادات النظام وتسلسل الموافقات
# ==============================================================================
class SystemSettings(models.Model):
    setting_key = models.CharField(max_length=255, unique=True, primary_key=True)
    setting_value = models.TextField()
    description = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.setting_key}: {self.setting_value}"

    class Meta:
        verbose_name_plural = "System Settings"

class ApprovalSequence(models.Model):
    SEQUENCE_TYPE_CHOICES = [('single_department','مشروع قسم واحد'),('multi_department','مشروع أقسام متعددة'),('multi_college','مشروع كليات متعددة'),('external','مشروع خارجي'),('government','مشروع حكومي')]
    sequence_id = models.AutoField(primary_key=True)
    sequence_type = models.CharField(max_length=50, choices=SEQUENCE_TYPE_CHOICES, unique=True,null=True)
    approval_levels = models.JSONField(default=list)
    description = models.TextField(blank=True, null=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True, blank=True)
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return f"{self.get_sequence_type_display()}"

    class Meta:
        verbose_name_plural = "Approval Sequences"


    assigned_at = models.DateTimeField(auto_now_add=True,null=True)

    class Meta:
        unique_together = ('group', 'project')
        verbose_name_plural = "Group Projects"





# ============================================================================== 
# 8. إنشاء المجموعات عبر الطلبات
# ==============================================================================
class GroupCreationRequest(models.Model):
    # المعلومات الأساسية للمجموعة
    group_name = models.CharField(max_length=255)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_requests')
    department_id = models.IntegerField()
    college_id = models.IntegerField()
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    
    # حالة الطلب الكلية (هل وافق الجميع أم لا يزال قيد الانتظار)
    is_fully_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"طلب مجموعة: {self.group_name} بواسطة {self.creator.name}"
    

class GroupMemberApproval(models.Model):
    # ربط العضو بطلب المجموعة
    request = models.ForeignKey(GroupCreationRequest, on_delete=models.CASCADE, related_name='approvals')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # تحديد دور العضو في هذا الطلب (طالب، مشرف، مساعد)
    ROLE_CHOICES = [
        ('student', 'طالب'),
        ('supervisor', 'مشرف'),
        ('co_supervisor', 'أستاذ مساعد'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # حالة موافقة هذا العضو تحديداً
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('accepted', 'تمت الموافقة'),
        ('rejected', 'مرفوض'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('request', 'user') # لمنع تكرار نفس الشخص في نفس الطلب



def check_and_finalize_group(request_id):
    try:
        group_request = GroupCreationRequest.objects.get(id=request_id)
        if group_request.is_fully_confirmed:
            return False

        total_members = group_request.approvals.count()
        accepted_members = group_request.approvals.filter(status='accepted').count()

        if total_members > 0 and total_members == accepted_members:
            with transaction.atomic():
                final_group = Group.objects.create(group_name=group_request.group_name)
                for approval in group_request.approvals.all():
                    if approval.role == 'student':
                        GroupMembers.objects.create(group=final_group, user=approval.user)
                    elif approval.role in ['supervisor','co_supervisor']:
                        GroupSupervisors.objects.create(group=final_group, user=approval.user, type=approval.role)
                group_request.is_fully_confirmed = True
                group_request.save()
                return True
    except Exception as e:
        print(f"Error finalizing group: {e}")
        return False
    return False
