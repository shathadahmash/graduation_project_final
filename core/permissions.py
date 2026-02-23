# core/permissions.py

from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from .models import Role, RolePermission, UserRoles

# ==============================================================================
# 1. قائمة الصلاحيات المتاحة في النظام
# ==============================================================================

PERMISSIONS_LIST = {
    # صلاحيات المجموعات
    'create_group': 'إنشاء مجموعة جديدة',
    'edit_group': 'تعديل بيانات المجموعة',
    'delete_group': 'حذف مجموعة',
    'invite_students': 'دعوة طلاب للمجموعة',
    'manage_group_members': 'إدارة أعضاء المجموعة',
    
    # صلاحيات المشاريع
    'create_project': 'إنشاء مشروع',
    'edit_project': 'تعديل المشروع',
    'delete_project': 'حذف المشروع',
    'submit_project': 'تقديم المشروع',
    'archive_project': 'أرشفة المشروع',
    
    # صلاحيات الموافقات
    'approve_project': 'الموافقة على المشروع',
    'reject_project': 'رفض المشروع',
    'request_modifications': 'طلب تعديلات',
    'assign_supervisor': 'تعيين مشرف',
    'assign_co_supervisor': 'تعيين مشرف مشارك',
    
    # صلاحيات النقل والتحويل
    'transfer_student': 'نقل طالب',
    'transfer_group': 'نقل مجموعة',
    'reassign_supervisor': 'إعادة تعيين المشرف',
    
    # صلاحيات الإشعارات
    'send_notification': 'إرسال إشعار',
    'view_notifications': 'عرض الإشعارات',
    'manage_notifications': 'إدارة الإشعارات',
    
    # صلاحيات الإدارة
    'manage_users': 'إدارة المستخدمين',
    'manage_roles': 'إدارة الأدوار',
    'manage_permissions': 'إدارة الصلاحيات',
    'view_reports': 'عرض التقارير',
    'manage_system_settings': 'إدارة إعدادات النظام',
    
    # صلاحيات المشاريع الخارجية
    'submit_external_project': 'تقديم مشروع خارجي',
    'manage_external_projects': 'إدارة المشاريع الخارجية',
}

# ==============================================================================
# 2. تعريف الأدوار والصلاحيات المرتبطة بها
# ==============================================================================

ROLES_PERMISSIONS = {
    'Student': [
        'create_group',
        'invite_students',
        'create_project',
        'edit_project',
        'submit_project',
        'view_notifications',
    ],
    
    'Supervisor': [
        'create_project',
        'edit_project',
        'approve_project',
        'reject_project',
        'request_modifications',
        'assign_co_supervisor',
        'manage_group_members',
        'view_notifications',
        'send_notification',
    ],
    
    'Co-supervisor': [
        'edit_project',
        'approve_project',
        'reject_project',
        'request_modifications',
        'view_notifications',
    ],
    
    'Department Head': [
        'approve_project',
        'reject_project',
        'request_modifications',
        'transfer_student',
        'transfer_group',
        'reassign_supervisor',
        'manage_group_members',
        'view_notifications',
        'send_notification',
        'view_reports',
    ],
    
    'Dean': [
        'approve_project',
        'reject_project',
        'request_modifications',
        'transfer_student',
        'transfer_group',
        'reassign_supervisor',
        'view_notifications',
        'send_notification',
        'view_reports',
    ],
    
    'University President': [
        'approve_project',
        'reject_project',
        'request_modifications',
        'transfer_student',
        'transfer_group',
        'reassign_supervisor',
        'view_notifications',
        'send_notification',
        'view_reports',
        'manage_system_settings',
        'manage_users',
        'manage_roles',
        'manage_permissions',
        'manage_system_settings',
        'view_reports',
        'view_notifications',
    ],
    
    'System Manager': [
        'manage_users',
        'manage_roles',
        'manage_permissions',
        'manage_system_settings',
        'view_reports',
        'view_notifications',
    ],
    
    'External Company': [
        'submit_external_project',
        'view_notifications',
    ],
}

# ==============================================================================
# 3. دوال مساعدة للتحقق من الصلاحيات
# ==============================================================================

class PermissionManager:
    """
    مدير الصلاحيات - يوفر دوال للتحقق من الصلاحيات والأدوار
    """
    
    @staticmethod
    def has_permission(user, permission_code):
        """
        التحقق من أن المستخدم يملك صلاحية معينة
        """
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        
        # الحصول على جميع الأدوار للمستخدم
        user_roles = UserRoles.objects.filter(user=user).values_list('role_id', flat=True)
        
        # الحصول على جميع الصلاحيات المرتبطة بهذه الأدوار
        permissions = RolePermission.objects.filter(
            role_id__in=user_roles,
            permission__name=permission_code
        ).exists()
        
        return permissions
    
    @staticmethod
    def has_any_permission(user, permission_codes):
        """
        التحقق من أن المستخدم يملك أي من الصلاحيات المعطاة
        """
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        
        for permission_code in permission_codes:
            if PermissionManager.has_permission(user, permission_code):
                return True
        return False
    
    @staticmethod
    def has_all_permissions(user, permission_codes):
        """
        التحقق من أن المستخدم يملك جميع الصلاحيات المعطاة
        """
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        
        for permission_code in permission_codes:
            if not PermissionManager.has_permission(user, permission_code):
                return False
        return True
    
    @staticmethod
    def get_user_roles(user):
        """
        الحصول على جميع أدوار المستخدم
        """
        if not user or not user.is_authenticated:
           return []
        return UserRoles.objects.filter(user=user).select_related('role').values_list('role__type', flat=True)
    
    @staticmethod
    def get_user_permissions(user):
        """
        الحصول على جميع صلاحيات المستخدم
        """
        if not user or not user.is_authenticated:
            return []
        if user.is_superuser:
            return list(PERMISSIONS_LIST.keys())
        
        user_roles = UserRoles.objects.filter(user=user).values_list('role_id', flat=True)
        permissions = RolePermission.objects.filter(
            role_id__in=user_roles
        ).values_list('permission__name', flat=True).distinct()
        
        return list(permissions)
    
    @staticmethod
    def is_supervisor(user):
        """التحقق من أن المستخدم مشرف"""
        if not user or not user.is_authenticated:
           return False
        return UserRoles.objects.filter(
            user=user,
            role__type__in=['Supervisor', 'Co-supervisor']
        ).exists()
    
    @staticmethod
    def is_admin(user):
        """التحقق من أن المستخدم إداري"""
        if not user or not user.is_authenticated:
          return False
        return UserRoles.objects.filter(
            user=user,
            role__type__in=['Department Head', 'Dean', 'University President', 'System Manager', 'Ministry','Admin']
        ).exists()
    
    @staticmethod
    def is_student(user):
        """التحقق من أن المستخدم طالب"""
        if not user or not user.is_authenticated:
          return False
        return UserRoles.objects.filter(
            user=user,
            role__type='Student'
        ).exists()
    
    @staticmethod
    def get_approval_chain(project_type):
        """
        الحصول على تسلسل الموافقات بناءً على نوع المشروع
        المشاريع الحكومية المشتركة أو المجموعات التي ينشئها الإداريون
        """
        approval_chains = {
            'single_department': [1],  # المشرف فقط
            'multi_department': [1, 2],  # المشرف + رئيس القسم
            'multi_college': [1, 2, 3, 4],  # المشرف + رئيس القسم + العميد + رئيس الجامعة
            'external': [1, 2],  # المشرف + رئيس القسم
            'government': [1, 2, 3, 4],  # تسلسل كامل
        }
        return approval_chains.get(project_type, [1, 2])
    
    @staticmethod
    def get_next_approver(current_level, approval_chain):
        """
        الحصول على الموافق التالي في التسلسل
        """
        if current_level < len(approval_chain):
            return approval_chain[current_level]
        return None


# ==============================================================================
# 4. Decorators للتحقق من الصلاحيات في Views
# ==============================================================================

from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect

def permission_required(permission_code ):
    """
    Decorator للتحقق من صلاحية معينة قبل تنفيذ الـ View
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not PermissionManager.has_permission(request.user, permission_code):
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'ليس لديك صلاحية للقيام بهذا الإجراء'
                    }, status=403)
                return redirect('permission_denied')
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def any_permission_required(*permission_codes):
    """
    Decorator للتحقق من أي من الصلاحيات المعطاة
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not PermissionManager.has_any_permission(request.user, permission_codes):
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'ليس لديك صلاحية للقيام بهذا الإجراء'
                    }, status=403)
                return redirect('permission_denied')
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def role_required(*role_types):
    """
    Decorator للتحقق من أن المستخدم يملك أحد الأدوار المعطاة
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user_roles = PermissionManager.get_user_roles(request.user)
            if not any(role in user_roles for role in role_types):
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'error',
                        'message': 'ليس لديك الدور المطلوب للقيام بهذا الإجراء'
                    }, status=403)
                return redirect('permission_denied')
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
