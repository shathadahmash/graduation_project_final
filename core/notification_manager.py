# core/notification_manager.py

from django.utils import timezone
from django.db.models import Q, Count
from .models import NotificationLog, GroupInvitation, ApprovalRequest
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class NotificationManager:
    """
    مدير الإشعارات المتقدم - يدير جميع عمليات الإشعارات
    """
    
    # قاموس أنواع الإشعارات مع معلوماتها
    NOTIFICATION_TYPES = {
        'invitation': {
            'title': 'دعوة مجموعة',
            'icon': 'envelope',
            'color': 'info',
            'priority': 'high'
        },
        'invitation_accepted': {
            'title': 'قبول دعوة',
            'icon': 'check-circle',
            'color': 'success',
            'priority': 'medium'
        },
        'invitation_rejected': {
            'title': 'رفض دعوة',
            'icon': 'times-circle',
            'color': 'danger',
            'priority': 'medium'
        },
        'invitation_expired': {
            'title': 'انتهاء صلاحية دعوة',
            'icon': 'clock',
            'color': 'warning',
            'priority': 'low'
        },
        'approval_request': {
            'title': 'طلب موافقة',
            'icon': 'file-check',
            'color': 'primary',
            'priority': 'high'
        },
        'approval_approved': {
            'title': 'تمت الموافقة',
            'icon': 'thumbs-up',
            'color': 'success',
            'priority': 'high'
        },
        'approval_rejected': {
            'title': 'تم الرفض',
            'icon': 'thumbs-down',
            'color': 'danger',
            'priority': 'high'
        },
        'system_alert': {
            'title': 'تنبيه نظام',
            'icon': 'exclamation-triangle',
            'color': 'warning',
            'priority': 'medium'
        },
        'system_info': {
            'title': 'معلومة نظام',
            'icon': 'info-circle',
            'color': 'info',
            'priority': 'low'
        },
        'reminder': {
            'title': 'تذكير',
            'icon': 'bell',
            'color': 'warning',
            'priority': 'medium'
        }
    }
    
    @staticmethod
    def create_notification(recipient, notification_type, title, message,
                          related_group=None, related_project=None,
                          related_user=None, related_approval=None,
                          priority='medium'):
        """
        إنشاء إشعار جديد
        
        Args:
            recipient: المستخدم المستقبل للإشعار
            notification_type: نوع الإشعار (invitation, approval_request, etc.)
            title: عنوان الإشعار
            message: محتوى الإشعار
            related_group: المجموعة المرتبطة (اختياري)
            related_project: المشروع المرتبط (اختياري)
            related_user: المستخدم المرتبط (اختياري)
            related_approval: طلب الموافقة المرتبط (اختياري)
            priority: أولوية الإشعار
        
        Returns:
            NotificationLog: الإشعار المنشأ أو None في حالة الخطأ
        """
        try:
            notification = NotificationLog.objects.create(
                recipient=recipient,
                notification_type=notification_type,
                title=title,
                message=message,
                related_group=related_group,
                related_project=related_project,
                related_user=related_user,
                related_approval=related_approval,
                is_read=False
            )
            logger.info(f"✓ تم إنشاء إشعار جديد: {notification.notification_id} للمستخدم {recipient.username}")
            return notification
        except Exception as e:
            logger.error(f"✗ خطأ في إنشاء الإشعار: {str(e)}")
            return None
    
    @staticmethod
    def get_user_notifications(user, limit=50, unread_only=False):
        """
        الحصول على إشعارات المستخدم
        
        Args:
            user: المستخدم
            limit: عدد الإشعارات المطلوب
            unread_only: عرض الإشعارات غير المقروءة فقط
        
        Returns:
            QuerySet: قائمة الإشعارات
        """
        query = NotificationLog.objects.filter(recipient=user)
        
        if unread_only:
            query = query.filter(is_read=False)
        
        return query.order_by('-created_at')[:limit]
    
    @staticmethod
    def get_unread_count(user):
        """
        الحصول على عدد الإشعارات غير المقروءة
        
        Args:
            user: المستخدم
        
        Returns:
            int: عدد الإشعارات غير المقروءة
        """
        return NotificationLog.objects.filter(
            recipient=user,
            is_read=False
        ).count()
    
    @staticmethod
    def get_unread_by_type(user):
        """
        الحصول على عدد الإشعارات غير المقروءة حسب النوع
        
        Args:
            user: المستخدم
        
        Returns:
            QuerySet: إحصائيات الإشعارات حسب النوع
        """
        return NotificationLog.objects.filter(
            recipient=user,
            is_read=False
        ).values('notification_type').annotate(count=Count('notification_id'))
    
    @staticmethod
    def mark_as_read(notification_id, user):
        """
        تحديد إشعار كمقروء
        
        Args:
            notification_id: معرف الإشعار
            user: المستخدم
        
        Returns:
            bool: True إذا نجحت العملية، False إذا فشلت
        """
        try:
            notification = NotificationLog.objects.get(
                notification_id=notification_id,
                recipient=user
            )
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            logger.info(f"✓ تم تحديد الإشعار {notification_id} كمقروء")
            return True
        except NotificationLog.DoesNotExist:
            logger.warning(f"⚠ محاولة تحديد إشعار غير موجود: {notification_id}")
            return False
    
    @staticmethod
    def mark_all_as_read(user):
        """
        تحديد جميع الإشعارات كمقروءة
        
        Args:
            user: المستخدم
        
        Returns:
            int: عدد الإشعارات التي تم تحديثها
        """
        count = NotificationLog.objects.filter(
            recipient=user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        logger.info(f"✓ تم تحديد {count} إشعار كمقروء للمستخدم {user.username}")
        return count
    
    @staticmethod
    def delete_notification(notification_id, user):
        """
        حذف إشعار
        
        Args:
            notification_id: معرف الإشعار
            user: المستخدم
        
        Returns:
            bool: True إذا نجحت العملية، False إذا فشلت
        """
        try:
            notification = NotificationLog.objects.get(
                notification_id=notification_id,
                recipient=user
            )
            notification.delete()
            logger.info(f"✓ تم حذف الإشعار {notification_id}")
            return True
        except NotificationLog.DoesNotExist:
            logger.warning(f"⚠ محاولة حذف إشعار غير موجود: {notification_id}")
            return False
    
    @staticmethod
    def delete_old_notifications(days=90):
        """
        حذف الإشعارات القديمة
        
        Args:
            days: عدد الأيام (حذف الإشعارات الأقدم من هذا العدد)
        
        Returns:
            int: عدد الإشعارات المحذوفة
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count, _ = NotificationLog.objects.filter(
            created_at__lt=cutoff_date
        ).delete()
        logger.info(f"✓ تم حذف {deleted_count} إشعار قديم")
        return deleted_count
    
    @staticmethod
    def get_notification_stats(user):
        """
        الحصول على إحصائيات الإشعارات
        
        Args:
            user: المستخدم
        
        Returns:
            dict: إحصائيات الإشعارات
        """
        total = NotificationLog.objects.filter(recipient=user).count()
        unread = NotificationLog.objects.filter(recipient=user, is_read=False).count()
        by_type = NotificationLog.objects.filter(
            recipient=user
        ).values('notification_type').annotate(count=Count('notification_id'))
        
        return {
            'total': total,
            'unread': unread,
            'by_type': list(by_type)
        }


class InvitationNotificationManager:
    """
    مدير إشعارات الدعوات - يدير جميع إشعارات دعوات المجموعات
    """
    
    @staticmethod
    def notify_invitation_sent(group, invited_student, invited_by):
        """
        إشعار الطالب بدعوة جديدة
        """
        return NotificationManager.create_notification(
            recipient=invited_student,
            notification_type='invitation',
            title='دعوة جديدة للانضمام إلى مجموعة',
            message=f'تم دعوتك من قبل {invited_by.name} للانضمام إلى مجموعة "{group.group_name}"',
            related_group=group,
            related_user=invited_by,
            priority='high'
        )
    
    @staticmethod
    def notify_invitation_accepted(invitation, invited_by):
        """
        إشعار منشئ المجموعة بقبول الدعوة
        """
        return NotificationManager.create_notification(
            recipient=invited_by,
            notification_type='invitation_accepted',
            title='قبول دعوة المجموعة',
            message=f'قبل {invitation.invited_student.name} دعوتك للانضمام إلى مجموعة "{invitation.group.group_name}"',
            related_group=invitation.group,
            related_user=invitation.invited_student,
            priority='medium'
        )
    
    @staticmethod
    def notify_invitation_rejected(invitation, invited_by):
        """
        إشعار منشئ المجموعة برفض الدعوة
        """
        return NotificationManager.create_notification(
            recipient=invited_by,
            notification_type='invitation_rejected',
            title='رفض دعوة المجموعة',
            message=f'رفض {invitation.invited_student.name} دعوتك للانضمام إلى مجموعة "{invitation.group.group_name}"',
            related_group=invitation.group,
            related_user=invitation.invited_student,
            priority='medium'
        )
    
    @staticmethod
    def notify_invitation_expiring_soon(invitation):
        """
        تذكير الطالب بانتهاء صلاحية الدعوة قريباً
        """
        return NotificationManager.create_notification(
            recipient=invitation.invited_student,
            notification_type='reminder',
            title='تذكير: انتهاء صلاحية الدعوة قريباً',
            message=f'ستنتهي صلاحية دعوتك للانضمام إلى مجموعة "{invitation.group.group_name}" في {invitation.expires_at.strftime("%Y-%m-%d %H:%M")}',
            related_group=invitation.group,
            priority='medium'
        )
    
    @staticmethod
    def notify_invitation_expired(invitation):
        """
        إشعار الطالب بانتهاء صلاحية الدعوة
        """
        return NotificationManager.create_notification(
            recipient=invitation.invited_student,
            notification_type='invitation_expired',
            title='انتهت صلاحية الدعوة',
            message=f'انتهت صلاحية دعوتك للانضمام إلى مجموعة "{invitation.group.group_name}"',
            related_group=invitation.group,
            priority='low'
        )


class ApprovalNotificationManager:
    """
    مدير إشعارات الموافقات - يدير جميع إشعارات طلبات الموافقة
    """
    
    @staticmethod
    def notify_approval_request(approval):
        """
        إشعار الموافق بطلب موافقة جديد
        """
        return NotificationManager.create_notification(
            recipient=approval.current_approver,
            notification_type='approval_request',
            title='طلب موافقة جديد',
            message=f'لديك طلب موافقة جديد من {approval.requested_by.name} بخصوص {approval.get_approval_type_display()}',
            related_group=approval.group,
            related_project=approval.project,
            related_approval=approval,
            priority='high'
        )
    
    @staticmethod
    def notify_approval_approved(approval):
        """
        إشعار مقدم الطلب بالموافقة
        """
        return NotificationManager.create_notification(
            recipient=approval.requested_by,
            notification_type='approval_approved',
            title='تمت الموافقة على طلبك',
            message=f'تمت الموافقة على طلب {approval.get_approval_type_display()} الخاص بك من قبل {approval.current_approver.name}',
            related_group=approval.group,
            related_project=approval.project,
            related_approval=approval,
            priority='high'
        )
    
    @staticmethod
    def notify_approval_rejected(approval):
        """
        إشعار مقدم الطلب برفض الموافقة
        """
        return NotificationManager.create_notification(
            recipient=approval.requested_by,
            notification_type='approval_rejected',
            title='تم رفض طلبك',
            message=f'تم رفض طلب {approval.get_approval_type_display()} الخاص بك من قبل {approval.current_approver.name}. السبب: {approval.comments or "لم يتم تحديد سبب"}',
            related_group=approval.group,
            related_project=approval.project,
            related_approval=approval,
            priority='high'
        )


class SystemNotificationManager:
    """
    مدير إشعارات النظام - يدير إشعارات النظام والتنبيهات العامة
    """
    
    @staticmethod
    def notify_system_alert(user, title, message):
        """
        إرسال تنبيه نظام لمستخدم معين
        """
        return NotificationManager.create_notification(
            recipient=user,
            notification_type='system_alert',
            title=title,
            message=message,
            priority='medium'
        )
    
    @staticmethod
    def notify_system_info(user, title, message):
        """
        إرسال معلومة نظام لمستخدم معين
        """
        return NotificationManager.create_notification(
            recipient=user,
            notification_type='system_info',
            title=title,
            message=message,
            priority='low'
        )
    
    @staticmethod
    def notify_all_users(title, message, notification_type='system_info'):
        """
        إرسال إشعار لجميع المستخدمين النشطين
        
        Args:
            title: عنوان الإشعار
            message: محتوى الإشعار
            notification_type: نوع الإشعار
        
        Returns:
            int: عدد المستخدمين الذين تم إرسال الإشعار لهم
        """
        from .models import User
        
        users = User.objects.filter(is_active=True)
        count = 0
        
        for user in users:
            NotificationManager.create_notification(
                recipient=user,
                notification_type=notification_type,
                title=title,
                message=message,
                priority='medium'
            )
            count += 1
        
        logger.info(f"✓ تم إرسال إشعار نظام إلى {count} مستخدم")
        return count
