# core/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import NotificationLog, User
from .serializers import NotificationLogSerializer


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket Consumer للإشعارات الفورية
    يتعامل مع الاتصالات الفورية للإشعارات
    """
    
    async def connect(self):
        """
        عند الاتصال بـ WebSocket
        """
        self.user = self.scope["user"]
        self.user_id = self.user.id if self.user.is_authenticated else None
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # إضافة المستخدم إلى مجموعة الإشعارات الخاصة به
        self.room_group_name = f'notifications_{self.user_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"المستخدم {self.user.username} متصل بـ WebSocket")
    
    async def disconnect(self, close_code):
        """
        عند قطع الاتصال بـ WebSocket
        """
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        print(f"المستخدم {self.user.username} قطع الاتصال")
    
    async def receive(self, text_data):
        """
        استقبال رسائل من العميل
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_as_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_as_read(notification_id)
            
            elif message_type == 'get_unread_count':
                count = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': count
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'خطأ في صيغة البيانات'
            }))
    
    async def notification_message(self, event):
        """
        استقبال إشعار من المجموعة وإرساله للعميل
        """
        notification_data = event['notification']
        
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': notification_data
        }))
    
    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """
        تحديد إشعار كمقروء
        """
        try:
            notification = NotificationLog.objects.get(
                notification_id=notification_id,
                recipient=self.user
            )
            notification.is_read = True
            notification.save()
            return True
        except NotificationLog.DoesNotExist:
            return False
    
    @database_sync_to_async
    def get_unread_count(self):
        """
        الحصول على عدد الإشعارات غير المقروءة
        """
        return NotificationLog.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()


class ApprovalConsumer(AsyncWebsocketConsumer):
    """
    WebSocket Consumer لطلبات الموافقة الفورية
    """
    
    async def connect(self):
        """
        عند الاتصال بـ WebSocket
        """
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # إضافة المستخدم إلى مجموعة الموافقات الخاصة به
        self.room_group_name = f'approvals_{self.user.id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """
        عند قطع الاتصال بـ WebSocket
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def approval_request_message(self, event):
        """
        استقبال طلب موافقة جديد
        """
        approval_data = event['approval']
        
        await self.send(text_data=json.dumps({
            'type': 'approval_request',
            'approval': approval_data
        }))
