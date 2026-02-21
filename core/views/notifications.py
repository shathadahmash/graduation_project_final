from rest_framework import viewsets,permissions
from rest_framework.response import Response
from rest_framework.decorators import action


from core.models import (
  NotificationLog
)
from core.serializers.notifications import (
   NotificationLogSerializer,
)

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from core.models import NotificationLog  # تأكدي من استيراد الموديل الصحيح



class NotificationViewSet(viewsets.ModelViewSet): # غيرتها لـ ModelViewSet ليعمل الحذف
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationLogSerializer

    def get_queryset(self):
        return NotificationLog.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    # def mark_all_read(self, request):
    #     #self.get_queryset().update(status='read')
    #     #fatima modified the previous line to this 
    #     self.get_queryset().update(is_read=True,read_at=timezone.now)

    def mark_all_read(self, _request):
        # التعديل هنا: نغير الحقل الصحيح is_read
        self.get_queryset().update(is_read=True)
        return Response({'status': 'success'})
        
    def destroy(self, _request, *args, **kwargs):
        notification = self.get_object()
        notification.delete()
        return Response(status=204)
