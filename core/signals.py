# core/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GroupInvitation, ApprovalRequest
from .notification_manager import (
    InvitationNotificationManager,
    ApprovalNotificationManager
)
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=GroupInvitation)
def handle_group_invitation(sender, instance, created, **kwargs):
    """
    معالج تلقائي عند إنشاء دعوة مجموعة جديدة
    يتم استدعاؤه تلقائياً عند حفظ دعوة جديدة
    """
    if created:
        try:
            InvitationNotificationManager.notify_invitation_sent(
                group=instance.group,
                invited_student=instance.invited_student,
                invited_by=instance.invited_by
            )
            logger.info(f"✓ تم إرسال إشعار دعوة للطالب {instance.invited_student.username}")
        except Exception as e:
            logger.error(f"✗ خطأ في إرسال إشعار الدعوة: {str(e)}")


@receiver(post_save, sender=ApprovalRequest)
def handle_approval_request(sender, instance, created, **kwargs):
    """
    معالج تلقائي عند إنشاء طلب موافقة جديد
    يتم استدعاؤه تلقائياً عند حفظ طلب موافقة جديد
    """
    if created:
        try:
            ApprovalNotificationManager.notify_approval_request(instance)
            logger.info(f"✓ تم إرسال إشعار طلب موافقة للموافق {instance.current_approver.username}")
        except Exception as e:
            logger.error(f"✗ خطأ في إرسال إشعار الموافقة: {str(e)}")
