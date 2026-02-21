from rest_framework import serializers
from core.models import (
    NotificationLog, Notification,
)

class NotificationLogSerializer(serializers.ModelSerializer):
    # الحقل الآن مخزن كرقم مباشرة في قاعدة البيانات
    # سنعرضه كما هو لكي يستخدمه React فوراً
    status = serializers.SerializerMethodField()

    class Meta:
        model = NotificationLog
        fields = [
            'notification_id', 
            'notification_type', 
            'title', 
            'message', 
            'is_read', 
            'status', 
            'related_id',  # هذا الحقل الآن يحمل ID الموافقة الفردية مباشرة
            'created_at'
        ]

    def get_status(self, obj):
        return 'read' if obj.is_read else 'unread'
    

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'