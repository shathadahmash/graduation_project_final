# core/tasks.py

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import GroupInvitation, NotificationLog
from datetime import timedelta

# ==============================================================================
# 1. مهام الإشعارات البريدية
# ==============================================================================

@shared_task
def send_email_task(subject, message, recipient_email):
    """
    مهمة غير متزامنة لإرسال البريد الإلكتروني
    """
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
            fail_silently=False,
        )
        return f"تم إرسال البريد إلى {recipient_email}"
    except Exception as e:
        return f"خطأ في إرسال البريد: {str(e)}"


@shared_task
def send_notification_email(notification_id):
    """
    مهمة لإرسال إشعار عبر البريد الإلكتروني
    """
    try:
        from .models import NotificationLog
        notification = NotificationLog.objects.get(notification_id=notification_id)
        
        subject = f"[{notification.get_notification_type_display()}] {notification.title}"
        message = f"{notification.message}\n\nتم الإرسال في: {notification.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [notification.recipient.email],
            fail_silently=False,
        )
        
        notification.is_sent_email = True
        notification.save()
        
        return f"تم إرسال الإشعار إلى {notification.recipient.email}"
    except Exception as e:
        return f"خطأ: {str(e)}"


# ==============================================================================
# 2. مهام انتهاء صلاحية الدعوات
# ==============================================================================

@shared_task
def expire_pending_invitations():
    """
    مهمة دورية لتحديد الدعوات المنتهية الصلاحية
    تُشغل كل ساعة
    """
    now = timezone.now()
    expired_count = 0
    
    # الحصول على الدعوات المعلقة التي انتهت صلاحيتها
    expired_invitations = GroupInvitation.objects.filter(
        status='pending',
        expires_at__lt=now
    )
    
    for invitation in expired_invitations:
        invitation.status = 'expired'
        invitation.save()
        expired_count += 1
        
        # إشعار منشئ المجموعة
        from .utils import NotificationService
        NotificationService.create_notification(
            recipient=invitation.invited_by,
            notification_type='reminder',
            title='انتهت صلاحية الدعوة',
            message=f'انتهت صلاحية دعوة {invitation.invited_student.name} للانضمام إلى مجموعة {invitation.group.group_name}',
            related_group=invitation.group,
            related_user=invitation.invited_student,
        )
    
    return f"تم تحديد {expired_count} دعوة منتهية الصلاحية"


# ==============================================================================
# 3. مهام التذكيرات
# ==============================================================================

@shared_task
def send_pending_approvals_reminder():
    """
    مهمة دورية لإرسال تذكيرات للموافقين بالطلبات المعلقة
    تُشغل يومياً
    """
    from .models import ApprovalRequest
    
    # الحصول على طلبات الموافقة المعلقة
    pending_approvals = ApprovalRequest.objects.filter(status='pending')
    
    for approval in pending_approvals:
        # إرسال تذكير إذا مرت أكثر من 24 ساعة
        if (timezone.now() - approval.created_at).days >= 1:
            from .utils import NotificationService
            NotificationService.create_notification(
                recipient=approval.current_approver,
                notification_type='reminder',
                title='تذكير: طلب موافقة معلق',
                message=f'لديك طلب موافقة معلق من نوع {approval.get_approval_type_display()} منذ {(timezone.now() - approval.created_at).days} أيام',
                related_group=approval.group,
                related_project=approval.project,
                related_approval=approval,
            )
    
    return f"تم إرسال تذكيرات للموافقين"


@shared_task
def send_pending_invitations_reminder():
    """
    مهمة دورية لإرسال تذكيرات للطلاب بالدعوات المعلقة
    تُشغل كل 12 ساعة
    """
    from .models import GroupInvitation
    
    # الحصول على الدعوات المعلقة
    pending_invitations = GroupInvitation.objects.filter(status='pending')
    
    for invitation in pending_invitations:
        # إرسال تذكير إذا مرت أكثر من 24 ساعة
        if (timezone.now() - invitation.created_at).hours >= 24:
            from .utils import NotificationService
            NotificationService.create_notification(
                recipient=invitation.invited_student,
                notification_type='reminder',
                title='تذكير: دعوة مجموعة معلقة',
                message=f'لديك دعوة معلقة للانضمام إلى مجموعة {invitation.group.group_name}. الدعوة تنتهي صلاحيتها في {(invitation.expires_at - timezone.now()).hours} ساعات',
                related_group=invitation.group,
                related_user=invitation.invited_by,
            )
    
    return f"تم إرسال تذكيرات للطلاب"


# ==============================================================================
# 4. مهام تنظيف البيانات
# ==============================================================================

@shared_task
def cleanup_old_notifications():
    """
    مهمة دورية لحذف الإشعارات القديمة (أكثر من 90 يوم)
    تُشغل أسبوعياً
    """
    from .models import NotificationLog
    
    cutoff_date = timezone.now() - timedelta(days=90)
    deleted_count, _ = NotificationLog.objects.filter(
        created_at__lt=cutoff_date
    ).delete()
    
    return f"تم حذف {deleted_count} إشعار قديم"


@shared_task
def cleanup_old_expired_invitations():
    """
    مهمة دورية لحذف الدعوات المنتهية القديمة (أكثر من 30 يوم)
    تُشغل أسبوعياً
    """
    from .models import GroupInvitation
    
    cutoff_date = timezone.now() - timedelta(days=30)
    deleted_count, _ = GroupInvitation.objects.filter(
        status__in=['expired', 'rejected'],
        responded_at__lt=cutoff_date
    ).delete()
    
    return f"تم حذف {deleted_count} دعوة قديمة"
