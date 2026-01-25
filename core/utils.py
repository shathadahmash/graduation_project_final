# core/utils.py

from django.utils import timezone
from datetime import timedelta
from .models import NotificationLog, GroupInvitation, ApprovalRequest, SystemSettings
from django.core.mail import send_mail
from django.conf import settings

# ==============================================================================
# 1. دوال الإشعارات
# ==============================================================================

class NotificationService:
    """
    خدمة الإشعارات - تتعامل مع إنشاء وإرسال الإشعارات
    """
    
    @staticmethod
    def create_notification(recipient, notification_type, title, message, 
                          related_group=None, related_project=None, 
                          related_user=None, related_approval=None):
        """
        إنشاء إشعار جديد
        """
        notification = NotificationLog.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            related_group=related_group,
            related_project=related_project,
            related_user=related_user,
            related_approval=related_approval,
        )
        
        # إرسال البريد الإلكتروني (يمكن جعله async مع Celery)
        NotificationService.send_email_notification(notification)
        
        return notification
    
    @staticmethod
    def send_email_notification(notification):
        """
        إرسال إشعار عبر البريد الإلكتروني
        """
        try:
            subject = f"[{notification.get_notification_type_display()}] {notification.title}"
            message = f"{notification.message}\n\nتم الإرسال في: {notification.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [notification.recipient.email],
                fail_silently=True,
            )
            
            notification.is_sent_email = True
            notification.save()
        except Exception as e:
            print(f"خطأ في إرسال البريد: {str(e)}")
    
    @staticmethod
    def mark_as_read(notification_id, user):
        """
        تحديد الإشعار كمقروء
        """
        try:
            notification = NotificationLog.objects.get(
                notification_id=notification_id,
                recipient=user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            return True
        except NotificationLog.DoesNotExist:
            return False
    
    @staticmethod
    def get_unread_count(user):
        """
        الحصول على عدد الإشعارات غير المقروءة
        """
        return NotificationLog.objects.filter(
            recipient=user,
            is_read=False
        ).count()
    
    @staticmethod
    def get_user_notifications(user, limit=20):
        """
        الحصول على آخر إشعارات المستخدم
        """
        return NotificationLog.objects.filter(
            recipient=user
        ).order_by('-created_at')[:limit]


# ==============================================================================
# 2. دوال إدارة الدعوات
# ==============================================================================

class InvitationService:
    """
    خدمة الدعوات - تتعامل مع إنشاء وقبول ورفض الدعوات
    """
    
    @staticmethod
    def send_invitation(group, invited_student, invited_by):
        """
        إرسال دعوة لطالب للانضمام إلى مجموعة
        """
        # التحقق من عدم وجود دعوة سابقة
        existing = GroupInvitation.objects.filter(
            group=group,
            invited_student=invited_student
        ).first()
        
        if existing:
            return existing, False
        
        # إنشاء دعوة جديدة
        invitation = GroupInvitation.objects.create(
            group=group,
            invited_student=invited_student,
            invited_by=invited_by,
        )
        
        # إرسال إشعار للطالب المدعو
        NotificationService.create_notification(
            recipient=invited_student,
            notification_type='invitation',
            title=f'دعوة للانضمام إلى مجموعة {group.group_name}',
            message=f'تم دعوتك من قبل {invited_by.name} للانضمام إلى مجموعة {group.group_name}. لديك 48 ساعة للرد على الدعوة.',
            related_group=group,
            related_user=invited_by,
        )
        
        return invitation, True
    
    @staticmethod
    def accept_invitation(invitation_id, user):
        """
        قبول دعوة
        """
        try:
            invitation = GroupInvitation.objects.get(
                invitation_id=invitation_id,
                invited_student=user,
                status='pending'
            )
            
            # التحقق من انتهاء الصلاحية
            if invitation.is_expired():
                invitation.status = 'expired'
                invitation.save()
                return None, 'انتهت صلاحية الدعوة'
            
            # قبول الدعوة
            invitation.status = 'accepted'
            invitation.responded_at = timezone.now()
            invitation.save()
            
            # إضافة الطالب إلى المجموعة
            from .models import GroupMembers
            GroupMembers.objects.get_or_create(
                user=user,
                group=invitation.group
            )
            
            # إزالة الطالب من المجموعات المعلقة الأخرى
            InvitationService.remove_from_pending_groups(user, invitation.group)
            
            # إشعار منشئ المجموعة
            NotificationService.create_notification(
                recipient=invitation.invited_by,
                notification_type='message',
                title=f'قبول الدعوة',
                message=f'قبل {user.name} دعوتك للانضمام إلى مجموعة {invitation.group.group_name}',
                related_group=invitation.group,
                related_user=user,
            )
            
            return invitation, None
        except GroupInvitation.DoesNotExist:
            return None, 'الدعوة غير موجودة'
    
    @staticmethod
    def reject_invitation(invitation_id, user):
        """
        رفض دعوة
        """
        try:
            invitation = GroupInvitation.objects.get(
                invitation_id=invitation_id,
                invited_student=user,
                status='pending'
            )
            
            invitation.status = 'rejected'
            invitation.responded_at = timezone.now()
            invitation.save()
            
            # إشعار منشئ المجموعة
            NotificationService.create_notification(
                recipient=invitation.invited_by,
                notification_type='message',
                title=f'رفض الدعوة',
                message=f'رفض {user.name} دعوتك للانضمام إلى مجموعة {invitation.group.group_name}. يرجى اختيار طالب آخر.',
                related_group=invitation.group,
                related_user=user,
            )
            
            return invitation, None
        except GroupInvitation.DoesNotExist:
            return None, 'الدعوة غير موجودة'
    
    @staticmethod
    def remove_from_pending_groups(user, accepted_group):
        """
        إزالة الطالب من جميع المجموعات المعلقة الأخرى
        """
        pending_invitations = GroupInvitation.objects.filter(
            invited_student=user,
            status='pending'
        ).exclude(group=accepted_group)
        
        for invitation in pending_invitations:
            invitation.status = 'expired'
            invitation.responded_at = timezone.now()
            invitation.save()
            
            # إشعار منشئ المجموعة
            NotificationService.create_notification(
                recipient=invitation.invited_by,
                notification_type='message',
                title=f'انسحاب من الدعوة',
                message=f'انسحب {user.name} من دعوتك للانضمام إلى مجموعة {invitation.group.group_name} لأنه قبل دعوة أخرى.',
                related_group=invitation.group,
                related_user=user,
            )


# ==============================================================================
# 3. دوال إدارة الموافقات
# ==============================================================================

class ApprovalService:
    """
    خدمة الموافقات - تتعامل مع تسلسل الموافقات
    """
    
    @staticmethod
    def create_approval_request(approval_type, group=None, project=None, 
                               requested_by=None, approval_level=1):
        """
        إنشاء طلب موافقة جديد
        """
        from .models import User
        
        # الحصول على الموافق الحالي بناءً على مستوى الموافقة
        current_approver = ApprovalService.get_approver_by_level(
            approval_level, group, project
        )
        
        if not current_approver:
            return None, 'لم يتم العثور على موافق'
        
        approval_request = ApprovalRequest.objects.create(
            approval_type=approval_type,
            group=group,
            project=project,
            requested_by=requested_by,
            current_approver=current_approver,
            approval_level=approval_level,
        )
        
        # إشعار الموافق
        NotificationService.create_notification(
            recipient=current_approver,
            notification_type='approval',
            title=f'طلب موافقة جديد',
            message=f'لديك طلب موافقة جديد من نوع {approval_request.get_approval_type_display()}',
            related_group=group,
            related_project=project,
            related_approval=approval_request,
        )
        
        return approval_request, None
    
    @staticmethod
    def get_approver_by_level(level, group=None, project=None):
        """
        الحصول على الموافق بناءً على مستوى الموافقة
        """
        from .models import User, GroupSupervisors, Department
        
        if level == 1:  # المشرف
            if group:
                supervisor = GroupSupervisors.objects.filter(group=group).first()
                return supervisor.user if supervisor else None
        elif level == 2:  # رئيس القسم
            if group:
                department = group.project.department if hasattr(group.project, 'department') else None
                if department:
                    # هنا نحتاج إلى ربط رئيس القسم بالقسم
                    # يمكنك إضافة حقل في نموذج Department
                    pass
        elif level == 3:  # العميد
            pass
        elif level == 4:  # رئيس الجامعة
            pass
        
        return None
    
    @staticmethod
    def approve_request(approval_id, approver, comments=None):
        """
        الموافقة على طلب
        """
        try:
            approval = ApprovalRequest.objects.get(
                approval_id=approval_id,
                current_approver=approver,
                status='pending'
            )
            
            approval.status = 'approved'
            approval.comments = comments
            approval.approved_at = timezone.now()
            approval.save()
            
            # إشعار الطالب/المجموعة
            if approval.group:
                NotificationService.create_notification(
                    recipient=approval.requested_by,
                    notification_type='approval',
                    title=f'تمت الموافقة على الطلب',
                    message=f'تمت الموافقة على طلب {approval.get_approval_type_display()} من قبل {approver.name}',
                    related_group=approval.group,
                    related_approval=approval,
                )
            
            return approval, None
        except ApprovalRequest.DoesNotExist:
            return None, 'الطلب غير موجود'
    
    @staticmethod
    def reject_request(approval_id, approver, comments=None):
        """
        رفض طلب
        """
        try:
            approval = ApprovalRequest.objects.get(
                approval_id=approval_id,
                current_approver=approver,
                status='pending'
            )
            
            approval.status = 'rejected'
            approval.comments = comments
            approval.approved_at = timezone.now()
            approval.save()
            
            # إشعار الطالب/المجموعة
            if approval.group:
                NotificationService.create_notification(
                    recipient=approval.requested_by,
                    notification_type='rejection',
                    title=f'تم رفض الطلب',
                    message=f'تم رفض طلب {approval.get_approval_type_display()} من قبل {approver.name}. التعليقات: {comments}',
                    related_group=approval.group,
                    related_approval=approval,
                )
            
            return approval, None
        except ApprovalRequest.DoesNotExist:
            return None, 'الطلب غير موجود'


# ==============================================================================
# 4. دوال مساعدة أخرى
# ==============================================================================

def get_system_setting(key, default=None):
    """
    الحصول على إعداد نظام
    """
    try:
        setting = SystemSettings.objects.get(setting_key=key)
        return setting.setting_value
    except SystemSettings.DoesNotExist:
        return default


def set_system_setting(key, value, description=None):
    """
    تعيين إعداد نظام
    """
    setting, created = SystemSettings.objects.update_or_create(
        setting_key=key,
        defaults={'setting_value': value, 'description': description}
    )
    return setting
