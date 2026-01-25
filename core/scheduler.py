# core/scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from datetime import timedelta
from .models import GroupInvitation, NotificationLog
from .notification_manager import InvitationNotificationManager
import logging

logger = logging.getLogger(__name__)


class NotificationScheduler:
    """
    جدولة الإشعارات والتذكيرات
    يدير المهام المتكررة مثل التذكيرات والتنظيف
    """
    
    scheduler = None
    
    @staticmethod
    def start():
        """
        بدء جدولة الإشعارات
        يتم استدعاء هذه الدالة عند بدء التطبيق
        """
        if NotificationScheduler.scheduler is None:
            NotificationScheduler.scheduler = BackgroundScheduler()
            
            # جدولة فحص الدعوات المنتهية الصلاحية كل ساعة
            NotificationScheduler.scheduler.add_job(
                NotificationScheduler.check_expiring_invitations,
                'interval',
                hours=1,
                id='check_expiring_invitations',
                name='فحص الدعوات المنتهية الصلاحية قريباً'
            )
            
            # جدولة فحص الدعوات المنتهية الصلاحية كل 6 ساعات
            NotificationScheduler.scheduler.add_job(
                NotificationScheduler.check_expired_invitations,
                'interval',
                hours=6,
                id='check_expired_invitations',
                name='فحص الدعوات المنتهية الصلاحية'
            )
            
            # جدولة حذف الإشعارات القديمة يومياً
            NotificationScheduler.scheduler.add_job(
                NotificationScheduler.cleanup_old_notifications,
                'interval',
                days=1,
                id='cleanup_old_notifications',
                name='حذف الإشعارات القديمة'
            )
            
            NotificationScheduler.scheduler.start()
            logger.info("✓ تم بدء جدولة الإشعارات")
    
    @staticmethod
    def stop():
        """
        إيقاف جدولة الإشعارات
        يتم استدعاء هذه الدالة عند إيقاف التطبيق
        """
        if NotificationScheduler.scheduler is not None:
            NotificationScheduler.scheduler.shutdown()
            NotificationScheduler.scheduler = None
            logger.info("✓ تم إيقاف جدولة الإشعارات")
    
    @staticmethod
    def check_expiring_invitations():
        """
        فحص الدعوات التي ستنتهي صلاحيتها قريباً (خلال ساعة)
        يتم استدعاء هذه الدالة تلقائياً كل ساعة
        """
        try:
            now = timezone.now()
            one_hour_later = now + timedelta(hours=1)
            
            # البحث عن الدعوات التي ستنتهي صلاحيتها قريباً
            expiring_invitations = GroupInvitation.objects.filter(
                status='pending',
                expires_at__gte=now,
                expires_at__lte=one_hour_later
            )
            
            count = 0
            for invitation in expiring_invitations:
                # التحقق من أنه لم يتم إرسال تذكير مسبقاً
                existing_reminder = NotificationLog.objects.filter(
                    recipient=invitation.invited_student,
                    notification_type='reminder',
                    related_group=invitation.group,
                    created_at__gte=now - timedelta(hours=2)
                ).exists()
                
                if not existing_reminder:
                    InvitationNotificationManager.notify_invitation_expiring_soon(invitation)
                    count += 1
            
            logger.info(f"✓ تم إرسال {count} تذكير للدعوات المنتهية الصلاحية قريباً")
        except Exception as e:
            logger.error(f"✗ خطأ في فحص الدعوات المنتهية الصلاحية: {str(e)}")
    
    @staticmethod
    def check_expired_invitations():
        """
        فحص الدعوات المنتهية الصلاحية وتحديث حالتها
        يتم استدعاء هذه الدالة تلقائياً كل 6 ساعات
        """
        try:
            now = timezone.now()
            
            # البحث عن الدعوات المنتهية الصلاحية
            expired_invitations = GroupInvitation.objects.filter(
                status='pending',
                expires_at__lt=now
            )
            
            count = 0
            for invitation in expired_invitations:
                invitation.status = 'expired'
                invitation.save()
                
                # إرسال إشعار للطالب
                InvitationNotificationManager.notify_invitation_expired(invitation)
                count += 1
            
            logger.info(f"✓ تم تحديث حالة {count} دعوة منتهية الصلاحية")
        except Exception as e:
            logger.error(f"✗ خطأ في فحص الدعوات المنتهية الصلاحية: {str(e)}")
    
    @staticmethod
    def cleanup_old_notifications():
        """
        حذف الإشعارات القديمة (أكثر من 90 يوم)
        يتم استدعاء هذه الدالة تلقائياً يومياً
        """
        try:
            from .notification_manager import NotificationManager
            
            deleted_count = NotificationManager.delete_old_notifications(days=90)
            logger.info(f"✓ تم حذف {deleted_count} إشعار قديم")
        except Exception as e:
            logger.error(f"✗ خطأ في حذف الإشعارات القديمة: {str(e)}")
