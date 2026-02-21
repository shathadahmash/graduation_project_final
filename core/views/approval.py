from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import  transaction

from core.models import (
 ApprovalRequest ,GroupMemberApproval,check_and_finalize_group
)
from core.serializers.approvals import (
    ApprovalRequestSerializer
)

class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.all()
    serializer_class = ApprovalRequestSerializer
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        pk: هو الـ approval_id القادم من related_id في الإشعار
        """
        try:
            # 1. جلب طلب الموافقة الرئيسي (المحرك)
            approval_task = get_object_or_404(ApprovalRequest, approval_id=pk, current_approver=request.user)

            if approval_task.status != 'pending':
                return Response({"error": "لقد قمت بالرد مسبقاً على هذا الطلب"}, status=400)

            with transaction.atomic():
                # 2. تحديث سجل الموافقة الإداري (ApprovalRequest)
                approval_task.status = 'accepted'
                approval_task.approved_at = timezone.now()
                approval_task.save()

                # 3. تحديث سجل العضوية (GroupMemberApproval) المرتبط بهذا الطلب
                # نصل إليه من خلال المستخدم والطلب الأصلي
                member_approval = GroupMemberApproval.objects.filter(
                    user=request.user, 
                    request__group_name=approval_task.group.group_name if approval_task.group else "", # البحث عن طريق المجموعة
                    status='pending'
                ).last()

                if member_approval:
                    member_approval.status = 'accepted'
                    member_approval.responded_at = timezone.now()
                    member_approval.save()

                    # 4. استدعاء دالة التفعيل النهائية (الموجودة في موديلاتك)
                    is_done = check_and_finalize_group(member_approval.request.id)
                else:
                    is_done = False

            msg = "تمت الموافقة بنجاح"
            if is_done: msg = "تمت الموافقة واكتمل إنشاء المجموعة رسميًا!"
            
            return Response({"message": msg}, status=200)

        except Exception as e:
            return Response({"error": f"حدث خطأ: {str(e)}"}, status=500)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):

        try:
            approval_task = get_object_or_404(ApprovalRequest, approval_id=pk, current_approver=request.user)
            
            with transaction.atomic():
                # تحديث طلب الموافقة
                approval_task.status = 'rejected'
                approval_task.save()

                # تحديث سجل العضوية
                member_approval = GroupMemberApproval.objects.filter(
                    user=request.user, 
                    request__creator=approval_task.requested_by
                ).last()
                
                if member_approval:
                    member_approval.status = 'rejected'
                    member_approval.responded_at = timezone.now()
                    member_approval.save()

            return Response({"message": "تم رفض الطلب بنجاح"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

