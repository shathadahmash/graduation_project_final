from rest_framework import viewsets, status, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models, transaction
from django.db.models.functions import ExtractYear
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from django.http import JsonResponse

from .models import (
    User, Group, GroupMembers, GroupSupervisors, GroupInvitation,
    Project, ApprovalRequest, Role, AcademicAffiliation,
    GroupCreationRequest, GroupMemberApproval, NotificationLog, College, Department, UserRoles
)
from .serializers import (
    GroupSerializer, GroupDetailSerializer, GroupCreateSerializer,
    GroupMembersSerializer, GroupInvitationSerializer,
    CreateGroupInvitationSerializer, ProjectSerializer,
    ApprovalRequestSerializer, NotificationLogSerializer,
    RoleSerializer, UserSerializer
)
from .serializers import UserRolesSerializer
from .permissions import PermissionManager
from .utils import InvitationService, NotificationService
from core.notification_manager import NotificationManager


# ============================================================================================
# 1. GroupViewSet
# ============================================================================================

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
#fatima added this for the supervisor 
#(to only return groups of the supervisor)
    def get_queryset(self):
        user = self.request.user

        if PermissionManager.is_admin(user):
            return Group.objects.all()

        if PermissionManager.is_supervisor(user):
            return Group.objects.filter(groupsupervisors__user=user).distinct()

        if PermissionManager.is_student(user):
            return Group.objects.filter(groupmembers__user=user).distinct()

        return Group.objects.none()
    # group creation by the supervisor
    @action(detail=False, methods=['post'], url_path='create-by-supervisor', permission_classes=[IsAuthenticated])
    def create_by_supervisor(self, request):
        user = request.user

        if not PermissionManager.is_supervisor(user):
           return Response({"error": "فقط المشرف يمكنه تنفيذ هذا الإجراء"}, status=403)

        data = request.data
        group_name = data.get("group_name", "").strip()
        student_ids = data.get("student_ids", [])

        if not group_name:
           return Response({"error": "يرجى كتابة اسم المجموعة"}, status=400)

        if not student_ids or not isinstance(student_ids, list):
           return Response({"error": "يجب تحديد طالب واحد على الأقل"}, status=400)

    # مهم: منع أي طالب من أن يكون في مجموعة أخرى
        existing = GroupMembers.objects.filter(user_id__in=student_ids).values_list("user_id", flat=True)
        existing_ids = list(set(existing))
        if existing_ids:
            taken_students = User.objects.filter(id__in=existing_ids).values("id", "name")
            return Response({
               "error": "بعض الطلاب مرتبطون بالفعل بمجموعة أخرى",
               "students": list(taken_students)
            }, status=400)

    # جلب الطلاب
        students = list(User.objects.filter(id__in=student_ids))
        if len(students) != len(student_ids):
            return Response({"error": "تحقق من صحة student_ids"}, status=400)

    # أسماء الأعضاء لإرسالها في الإشعار
        member_names = [s.name or s.username for s in students]
        members_text = "، ".join(member_names)

        try:
            with transaction.atomic():
            # إنشاء المجموعة مباشرة
                group = Group.objects.create(group_name=group_name)

            # إضافة المشرف الحالي كمشرف للمجموعة
                GroupSupervisors.objects.create(user=user, group=group, type='supervisor')

            # إضافة الطلاب كأعضاء
                GroupMembers.objects.bulk_create([
                    GroupMembers(user=s, group=group) for s in students
                ])

            # إرسال إشعار لكل طالب: تمت إضافتك بواسطة المشرف + أسماء أعضاء المجموعة
                for s in students:
                    NotificationManager.create_notification(
                       recipient=s,
                       notification_type='invitation',  # أو system / message حسب اختياركم
                       title='تمت إضافتك إلى مجموعة',
                       message=f'قام المشرف {user.name or user.username} بإضافتك إلى مجموعة "{group.group_name}". أعضاء المجموعة: {members_text}',
                       related_group=group
                    )

                return Response({
                   "message": "تم إنشاء المجموعة وإضافة الطلاب بنجاح",
                    "group_id": group.group_id
                }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


# till here

    def get_serializer_class(self):
        if self.action == 'create':
            return GroupCreateSerializer
        if self.action in ['retrieve', 'my_group']:
            return GroupDetailSerializer
        return GroupSerializer

    def create(self, request, *args, **kwargs):
        """إنشاء طلب مجموعة جديد بناءً على الحقول الفعلية في الموديل"""
        
        # 1. استخراج البيانات من الطلب (تأكدي أن React يرسل هذه القيم)
        group_name = request.data.get('group_name')
        dept_id = request.data.get('department_id') # حقل إجباري في الموديل عندك
        coll_id = request.data.get('college_id')    # حقل إجباري في الموديل عندك
        note = request.data.get('note', "")
        
        student_ids = request.data.get('student_ids', [])
        supervisor_ids = request.data.get('supervisor_ids', [])
        co_supervisor_ids = request.data.get('co_supervisor_ids', [])

        # تحقق بسيط من البيانات الأساسية
        if not group_name or not dept_id or not coll_id:
            return Response({"error": "يرجى التأكد من إرسال اسم المجموعة، القسم، والكلية"}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                from .models import GroupCreationRequest, GroupMemberApproval, NotificationLog
                
                # 2. إنشاء الطلب الأساسي (مطابق تماماً لموديل GroupCreationRequest الخاص بك)
                group_req = GroupCreationRequest.objects.create(
                    group_name=group_name,
                    creator=request.user,
                    department_id=dept_id,
                    college_id=coll_id,
                    note=note,
                    is_fully_confirmed=False # الحالة الافتراضية كما في الموديل
                )

                # 3. دالة معالجة المدعوين
                # 3. دالة معالجة المدعوين
                def process_invitations(user_ids, role_name):
                    for u_id in user_ids:
                        if not u_id:
                            continue
                            
                        # تحويل المعرف لرقم للمقارنة
                        is_creator = int(u_id) == request.user.id

                        # 1. إنشاء سجل الموافقة للجميع (بما فيهم المنشئ)
                        approval = GroupMemberApproval.objects.create(
                            request=group_req,
                            user_id=u_id,
                            role=role_name,
                            # إذا كان هو المنشئ نضع الحالة 'accepted' فوراً، وإذا كان غيره نضع 'pending'
                            status='accepted' if is_creator else 'pending',
                            # إذا كان منشئ نضع وقت الاستجابة الآن
                            responded_at=timezone.now() if is_creator else None
                        )
                        
                        # 2. إرسال الإشعار فقط إذا لم يكن المستخدم هو منشئ الطلب
                        if not is_creator:
                            NotificationLog.objects.create(
                                recipient_id=u_id,
                                notification_type='invitation',
                                title="دعوة انضمام لمجموعة",
                                message=f"دعاك {request.user.name} لمجموعة: {group_name}",
                                related_id=approval.id 
                            )

                # 4. إضافة الجميع (طلاب، مشرفين، مساعدين)
                process_invitations(student_ids, 'student')
                process_invitations(supervisor_ids, 'supervisor')
                process_invitations(co_supervisor_ids, 'co_supervisor')

                return Response({
                    "message": "تم إنشاء طلب المجموعة بنجاح وإرسال الإشعارات للأعضاء",
                    "request_id": group_req.id
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"DEBUG Error during group creation: {str(e)}")
            return Response({"error": f"فشل الإنشاء: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add members to a group"""
        if not PermissionManager.can_manage_group(request.user):
            return Response({"error": "ليس لديك صلاحية إدارة المجموعة"}, status=status.HTTP_403_FORBIDDEN)

        group = self.get_object()
        student_ids = request.data.get('student_ids', [])
        for sid in student_ids:
            user = get_object_or_404(User, id=sid)
            GroupMembers.objects.get_or_create(user=user, group=group)
        return Response({"message": "تم إضافة الأعضاء بنجاح"})

    @action(detail=True, methods=['post'])
    def add_supervisor(self, request, pk=None):
        """Add supervisor to a group"""
        if not PermissionManager.is_admin(request.user):
            return Response({"error": "فقط الإدارة يمكنها تعيين مشرفين"}, status=status.HTTP_403_FORBIDDEN)

        group = self.get_object()
        supervisor_id = request.data.get('supervisor_id')
        supervisor = get_object_or_404(User, id=supervisor_id)
        GroupSupervisors.objects.get_or_create(user=supervisor, group=group)
        return Response({"message": "تم إضافة المشرف بنجاح"})

    @action(detail=True, methods=['post'], url_path='add-member')
    def send_member_approval(self, request, pk=None):
        """Send a group member approval request"""
        group = self.get_object()
        student_id = request.data.get('user_id')
        student = get_object_or_404(User, id=student_id)
        new_approval = GroupMemberApproval.objects.create(
            request=group.creation_request,
            user=student,
            role='student',
            status='pending'
        )
        NotificationManager.create_notification(
            recipient=student,
            notification_type='invitation',
            title='دعوة انضمام',
            message=f'تمت دعوتك للانضمام إلى مجموعة {group.group_name}',
            related_approval=new_approval
        )
        return Response({"message": "تم إرسال الدعوة للطالب بنجاح"})
    


    @action(detail=True, methods=['post'], url_path='add-member')
    def add_member(self, request, pk=None):
            group = self.get_object() # المجموعة الحالية
            student_id = request.data.get('user_id')
            
            # التأكد من وجود الطالب
            student = get_object_or_404(User, id=student_id)
            
            # إنشاء سجل موافقة جديد مرتبط بنفس طلب المجموعة
            new_approval = GroupMemberApproval.objects.create(
                request=group.creation_request, # نفترض وجود ForeignKey في موديل Group لطلب الإنشاء
                user=student,
                role='student',
                status='pending'
            )
            
            # إرسال إشعار للطالب
            from .notification_manager import NotificationManager
            NotificationManager.create_notification(
                recipient=student,
                notification_type='invitation',
                title='دعوة انضمام',
                message=f'تمت دعوتك للانضمام إلى مجموعة {group.group_name}',
                related_approval=new_approval # نربطه بالسجل الجديد
            )
            
            return Response({"message": "تم إرسال الدعوة للطالب بنجاح"})
            # ✅ Action لإرجاع مجموعة المستخدم الحالي

    @action(detail=False, methods=['get'], url_path='my-group')
    def my_group(self, request):
        user = request.user
        from .models import GroupCreationRequest, Group, GroupMembers, GroupSupervisors
        from django.db.models import Q
        
        try:
            # 1. حالة المجموعة الرسمية
            membership = GroupMembers.objects.filter(user=user).select_related('group', 'group__project').first()
            
            if membership:
                group_obj = membership.group
                members_list = GroupMembers.objects.filter(group=group_obj).select_related('user')
                supervisors_list = GroupSupervisors.objects.filter(group=group_obj).select_related('user')

                # بناء مصفوفة الموافقات (approvals) لكي تظهر صفحة حالة الفريق ولا تختفي الواجهة
                approvals_data = [{
                    "id": m.id,
                    "user_detail": {
                        "id": m.user.id,
                        "name": m.user.name or m.user.username,
                        "username": m.user.username,
                        "email": m.user.email
                    },
                    "status": "accepted",
                    "role": "student",
                    "created_at": None
                } for m in members_list]

                for s in supervisors_list:
                    approvals_data.append({
                        "id": s.id,
                        "user_detail": {
                            "id": s.user.id,
                            "name": s.user.name or s.user.username,
                            "username": s.user.username,
                            "email": s.user.email
                        },
                        "status": "accepted",
                        "role": "supervisor",  # ✅ أضيفي هذا للمشرفين
                        "created_at": None
                    })

                return Response([{
                    "id": group_obj.group_id, # المعرف الأساسي للواجهة
                    "group_id": group_obj.group_id,
                    "group_name": group_obj.group_name,
                    "is_official_group": True,
                    "is_pending": False,
                    "user_role_in_pending_request": "creator", # لضمان ظهور واجهة الإضافة
                    "project_detail": {
                        "project_id": group_obj.project.project_id if group_obj.project else None,
                        "title": group_obj.project.title if group_obj.project else "لم يحدد",
                        "state": group_obj.project.state if group_obj.project else "active"
                    },
                    "members": [{"user_detail": {"name": m.user.name or m.user.username}} for m in members_list],
                    "supervisors": [{"user_detail": {"name": s.user.name or s.user.username},"type": s.type} for s in supervisors_list],
                    "approvals": approvals_data, # هذا الحقل هو المسؤول عن ظهور واجهة حالة الفريق
                    "members_count": members_list.count()
                }])

            # 2. حالة طلب الإنشاء (الجدول المؤقت)
            creation_requests = GroupCreationRequest.objects.filter(
                Q(creator=user) | Q(approvals__user=user)
            ).filter(is_fully_confirmed=False).distinct().order_by('-created_at')

            if creation_requests.exists():
                # نستخدم السيريالايزر هنا لأنه يعمل بشكل مثالي مع الجداول المؤقتة
                serializer = GroupDetailSerializer(creation_requests, many=True)
                data_list = serializer.data
                
                for data, request_obj in zip(data_list, creation_requests):
                    data['is_official_group'] = False
                    data['is_pending'] = True
                    data['user_role_in_pending_request'] = 'creator' if request_obj.creator == user else 'invited'
                
                return Response(data_list)

            # 3. طالب حر
            return Response([{"is_official_group": False, "is_pending": False, "user_role_in_pending_request": "none"}])

        except Exception as e:
            print(f"CRITICAL ERROR: {str(e)}")
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['post'], url_path='send-individual-invite')
    def send_individual_invite(self, request, pk=None):
        group_creation_req = get_object_or_404(GroupCreationRequest, id=pk)
        target_user_id = request.data.get('user_id')
        role = request.data.get('role', 'student')

        if int(target_user_id) == request.user.id:
            return Response({"error": "لا يمكنك دعوة نفسك"}, status=400)

        with transaction.atomic():
            # استخدام update_or_create يمنع تكرار نفس الشخص في نفس الطلب
            member_status, created = GroupMemberApproval.objects.update_or_create(
                request=group_creation_req,
                user_id=target_user_id,
                defaults={'role': role, 'status': 'pending'}
            )

            # إرسال إشعار جديد (وحذف القديم إن وجد لنفس العضو في هذه المجموعة)
            NotificationLog.objects.filter(recipient_id=target_user_id, related_id=member_status.id).delete()
            
            NotificationLog.objects.create(
                recipient_id=target_user_id,
                notification_type='invitation',
                title='دعوة جديدة',
                message=f'تمت دعوتك للانضمام لمجموعة {group_creation_req.group_name}',
                related_id=member_status.id
            )

        return Response({"message": "تم إرسال الدعوة"}, status=201)
    

  

# داخل كلاس GroupViewSet
    @action(detail=True, methods=['post'], url_path='link-project')
    def link_project(self, request, pk=None):
        group = self.get_object()
        project_id = request.data.get('project_id')
        project = get_object_or_404(Project, project_id=project_id)

        # فحص الحالة بناءً على الموديل (يجب أن يكون مقبولاً ليتم حجزه)
        if project.state != 'Accepted':
            return Response({"error": "هذا المشروع غير متاح للارتباط حالياً"}, status=400)

        group.project = project
        group.save()

        # تحديث الحالة إلى إحدى خيارات الموديل (Reserved)
        project.state = 'Reserved' 
        project.save()

        return Response({"message": "تم ربط المشروع بنجاح"})

# ============================================================================================
# 2. ApprovalRequestViewSet
# ============================================================================================

import json
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ApprovalRequest, GroupMemberApproval # تأكدي من صحة المسار

class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ApprovalRequest.objects.all()
    serializer_class = ApprovalRequestSerializer
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        pk: هو الـ approval_id القادم من related_id في الإشعار
        """
        from .models import ApprovalRequest, GroupMemberApproval, check_and_finalize_group
        from django.db import transaction
        from django.utils import timezone

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
        from .models import ApprovalRequest, GroupMemberApproval
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
        


class GroupInvitationViewSet(viewsets.ModelViewSet):
    queryset = GroupInvitation.objects.all()
    serializer_class = GroupInvitationSerializer

    def get_queryset(self):
        user = self.request.user

        if PermissionManager.is_student(user):
            return GroupInvitation.objects.filter(invited_student=user)

        if PermissionManager.is_supervisor(user):
            return GroupInvitation.objects.filter(invited_by=user)

        return GroupInvitation.objects.none()

    def create(self, request, *args, **kwargs):
        """إرسال دعوات للطلاب"""
        serializer = CreateGroupInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group_id = serializer.validated_data['group_id']
        student_ids = serializer.validated_data['student_ids']

        group = get_object_or_404(Group, group_id=group_id)

        results = InvitationService.send_invitation(
            group=group,
            invited_student_ids=student_ids,
            invited_by=request.user
        )

        return Response(results, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """قبول الدعوة"""
        invitation = self.get_object()

        result = InvitationService.accept_invitation(invitation, request.user)
        return Response(result)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """رفض الدعوة"""
        invitation = self.get_object()

        result = InvitationService.reject_invitation(invitation, request.user)
        return Response(result)

# ============================================================================================
# 5. ProjectViewSet with filtering
# ============================================================================================

class ProjectFilter(django_filters.FilterSet):
    college = django_filters.NumberFilter(field_name="college__cid")
    department = django_filters.NumberFilter(field_name="department__department_id")
    # Project -> Group(s) (related_name='groups') -> GroupSupervisors -> user
    supervisor = django_filters.NumberFilter(field_name="groups__groupsupervisors__user__id")
    year = django_filters.NumberFilter(field_name="start_date__year")

    class Meta:
        model = Project
        fields = ['type', 'state', 'college', 'department', 'supervisor', 'year']


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-start_date')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ['title', 'description']

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.all().order_by('-start_date')
        project_type = self.request.query_params.get("type")
        if project_type:
            qs = qs.filter(type=project_type)
        
        # التحقق من دور الشركة الخارجية
        is_external = UserRoles.objects.filter(user=user, role__type__icontains='External').exists()
        
        if is_external:
            # عرض المشاريع التي أنشأتها هذه الشركة فقط
            return qs.filter(created_by=user)
        
        if PermissionManager.is_student(user) or PermissionManager.is_admin(user):
            return qs
        if PermissionManager.is_supervisor(user):
            return qs.filter(group__groupsupervisors__user=user).distinct()
        return qs.none()

    def create(self, request, *args, **kwargs):
        """Override create to default missing start_date to today and set created_by."""
        try:
            data = request.data.copy()
            if not data.get('start_date'):
                data['start_date'] = timezone.now().date().isoformat()

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            # Save with created_by set to request.user if serializer/model allows it
            instance = serializer.save(created_by=request.user)
            out_serializer = self.get_serializer(instance)
            return Response(out_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Project create failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='filter-options')
    def filter_options(self, request):
        try:
            colleges = College.objects.values('cid', 'name_ar')
            college_list = [{"id": c['cid'], "name": c['name_ar']} for c in colleges]

            active_supervisors = User.objects.filter(groupsupervisors__isnull=False).distinct().values('id', 'first_name', 'last_name')
            supervisor_list = [{"id": s['id'], "name": f"{s['first_name']} {s['last_name']}".strip() or "Unnamed Supervisor"} for s in active_supervisors]

            years_qs = Project.objects.annotate(year=ExtractYear('start_date')).values_list('year', flat=True).distinct().order_by('-year')
            years = [str(int(y)) for y in years_qs if y is not None]

            return Response({
                "colleges": college_list,
                "supervisors": supervisor_list,
                "years": years if years else ["2025"],
                "types": list(Project.objects.values_list('type', flat=True).distinct()),
                "states": list(Project.objects.values_list('state', flat=True).distinct())
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def my_project(self, request):
        user = request.user
        if not PermissionManager.is_student(user):
            return Response({'error': 'Unauthorized'}, status=403)
        project = Project.objects.filter(group__groupmembers__user=user).first()
        if not project:
            return Response({'message': 'No project found'}, status=200)
        return Response(ProjectSerializer(project).data)


#afnan add it

    @action(detail=False, methods=['post'], url_path='propose-project')
    def propose_project(self, request):
        data = request.data
        user = request.user
        
        # شغل نظيف: التأكد من تخزين القيم حسب الـ Choices في الموديل
        new_project = Project.objects.create(
        title=data.get('title'),
        description=data.get('description'),
        type='ProposedProject',
        state='Pending',
        start_date=timezone.now().date(),
        created_by=user,
        # جلب المعرفات مباشرة إذا كان المستخدم طالباً
        college_id=getattr(user, 'college_id', None),
        department_id=getattr(user, 'department_id', None)
             )
        
        return Response({
            "project_id": new_project.project_id,
            "message": "Project proposed successfully"
        }, status=201)






    @action(detail=False, methods=['post'])
    def propose(self, request):
        user = request.user
        title = request.data.get('title')
        description = request.data.get('description')
        
        if not title or not description:
            return Response({'error': 'Title and description are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # إنشاء المشروع مع تعيين created_by لضمان المزامنة
            project = Project.objects.create(
                title=title,
                description=description,
                type='PrivateCompany',
                state='Pending',
                created_by=user,
                start_date=timezone.now().date()
            )
            
            # محاولة إنشاء طلب موافقة تلقائي
            try:
                # البحث عن دور رئيس القسم
                dept_head_role = Role.objects.filter(type__icontains='Department Head').first()
                if dept_head_role:
                    dept_head = UserRoles.objects.filter(role=dept_head_role).first()
                    if dept_head:
                        ApprovalRequest.objects.create(
                            approval_type='external_project',
                            project=project,
                            requested_by=user,
                            current_approver=dept_head.user,
                            status='pending'
                        )
            except Exception as e:
                print(f"Approval request creation failed: {e}")

            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Project creation failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch', 'put'])
    def update_project(self, request, pk=None):
        project = self.get_object()
        if project.created_by != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_project(self, request, pk=None):
        project = self.get_object()

        # Check if user has delete permission or is the project creator
        from .permissions import PermissionManager
        user_can_delete = False

        # User can delete if they have the permission
        if PermissionManager.has_permission(request.user, 'delete_project'):
            user_can_delete = True
        # Or if they are the project creator
        elif project.created_by == request.user:
            user_can_delete = True
        # Or if they are a dean/admin and the project belongs to their college
        elif PermissionManager.is_admin(request.user):
            # Get user's college from their affiliation
            user_affiliation = request.user.academicaffiliation_set.order_by('-start_date').first()
            if user_affiliation and user_affiliation.college:
                # Check if project belongs to dean's college (via groups/departments)
                from .models import Group
                project_groups = Group.objects.filter(project=project)
                for group in project_groups:
                    if group.department and group.department.college == user_affiliation.college:
                        user_can_delete = True
                        break
                # Also check direct project college if no groups found
                if not user_can_delete and project.college == user_affiliation.college:
                    user_can_delete = True

        if not user_can_delete:
            return Response({'error': 'Unauthorized - You do not have permission to delete this project'}, status=status.HTTP_403_FORBIDDEN)

        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================================
# 6. Dropdown data API
# ============================================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dropdown_data(request):
    user = request.user
    user_affiliation = user.academicaffiliation_set.order_by('-start_date').first()
    user_department = user_affiliation.department if user_affiliation else None
    user_college = user_affiliation.college if user_affiliation else None

    # Students
    if PermissionManager.is_student(user) and user_department:
        student_role = Role.objects.filter(type='Student').first()
        students = User.objects.filter(userroles__role=student_role, academicaffiliation__department=user_department).exclude(id=user.id).distinct() if student_role else User.objects.none()
    else:
        students = User.objects.filter(userroles__role__type='Student').exclude(id=user.id).distinct()

    # Supervisors
    if user_college:
        supervisor_role = Role.objects.filter(type='supervisor').first()
        supervisors = User.objects.filter(userroles__role=supervisor_role, academicaffiliation__college=user_college).distinct() if supervisor_role else User.objects.none()
    else:
        supervisors = User.objects.filter(userroles__role__type='supervisor').distinct()

    # Co-supervisors
    if user_college:
        co_supervisor_role = Role.objects.filter(type='Co-supervisor').first()
        assistants = User.objects.filter(userroles__role=co_supervisor_role, academicaffiliation__college=user_college).distinct() if co_supervisor_role else User.objects.none()
    else:
        assistants = User.objects.filter(userroles__role__type='Co-supervisor').distinct()

    return Response({
        "students": [{"id": s.id, "name": s.name} for s in students],
        "supervisors": [{"id": sp.id, "name": sp.name} for sp in supervisors],
        "assistants": [{"id": a.id, "name": a.name} for a in assistants]
    })


# ============================================================================================
# 7. Notifications
# ============================================================================================

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from .models import NotificationLog  # تأكدي من استيراد الموديل الصحيح
from .serializers import NotificationLogSerializer # سنقوم بتعريفه في الخطوة التالية
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

# ============================================================================================
# 11. UserRoles (assign/remove roles to users)
# ============================================================================================

class UserRolesViewSet(viewsets.ModelViewSet):
    queryset = UserRoles.objects.all()
    serializer_class = UserRolesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Accept either {user: id, role: id} or {user_id, role_id}
        data = request.data
        user_id = data.get('user') or data.get('user_id')
        role_id = data.get('role') or data.get('role_id')
        if not user_id or not role_id:
            return Response({'detail': 'user and role are required'}, status=400)
        # prevent duplicates
        obj, created = UserRoles.objects.get_or_create(user_id=user_id, role_id=role_id)
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=201 if created else 200)

    def destroy(self, request, *args, **kwargs):
        # support delete by query params ?user_id=&role_id=
        user_id = request.query_params.get('user') or request.query_params.get('user_id')
        role_id = request.query_params.get('role') or request.query_params.get('role_id')
        if user_id and role_id:
            qs = UserRoles.objects.filter(user_id=user_id, role_id=role_id)
            deleted, _ = qs.delete()
            if deleted:
                return Response(status=204)
            return Response({'detail': 'not found'}, status=404)
        return super().destroy(request, *args, **kwargs)


# ============================================================================================
# 8. Roles
# ============================================================================================

class RoleViewSet(viewsets.ModelViewSet):
    """Allow viewing and management of roles. Creation/update/deletion require authentication."""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


# ============================================================================================
# 9. Users
# ============================================================================================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        user = User.objects.create(username=data['username'], email=data.get('email', ''), name=data.get('name', ''))
        user.set_password(data.get('password', 'password123'))
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_fetch(request):
    """Bulk fetch multiple tables and specific fields.
    POST body: { requests: [ { table: 'projects', fields: ['project_id','title'] }, ... ] }
    Returns JSON mapping table -> list of rows (as dicts) or error.
    """
    # mapping of supported table keys to model classes
    mapping = {
        'projects': Project,
        'groups': Group,
        'group_members': GroupMembers,
        'group_supervisors': GroupSupervisors,
        'users': User,
        'academic_affiliations': AcademicAffiliation,
        'colleges': College,
        'departments': Department,
    }

    out = {}
    try:
        reqs = request.data.get('requests', [])
        import traceback
        for r in reqs:
            table = r.get('table')
            if not table or table not in mapping:
                out[table or 'unknown'] = {'error': 'unsupported table'}
                continue
            model = mapping[table]
            # compute default fields dynamically from model meta if not provided
            if r.get('fields'):
                fields = r.get('fields')
            else:
                pk = model._meta.pk.name
                # include up to 6 additional non-related fields
                extra = [f.name for f in model._meta.fields if f.name != pk]
                fields = [pk] + extra[:6]

            try:
                qs = model.objects.all().values(*fields)
                # Apply permission-aware filter for projects: external users only see their created ones
                if table == 'projects':
                    user = request.user
                    is_external = UserRoles.objects.filter(user=user, role__type__icontains='External').exists()
                    if is_external:
                        qs = qs.filter(created_by=user)
                out[table] = list(qs)
            except Exception as e:
                out[table] = {'error': str(e), 'traceback': traceback.format_exc()}
        return JsonResponse(out, safe=True)
    except Exception as e:
        import traceback
        return JsonResponse({'error': str(e), 'traceback': traceback.format_exc()}, status=400)


# ============================================================================================
# 10. Group creation & approval APIs
# ============================================================================================

#    تبع نظام الاشعارات 

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from .models import GroupCreationRequest, GroupMemberApproval
from core.notification_manager import NotificationManager # حسب مسار ملفك

@api_view(['POST'])
def submit_group_creation_request(request):
    data = request.data
    user = request.user # الطالب الذي أنشأ الطلب

    try:
        with transaction.atomic():
            # 1. إنشاء رأس الطلب في الجدول الوسيط
            group_request = GroupCreationRequest.objects.create(
                group_name=data['group_name'],
                creator=user,
                department_id=data['department_id'],
                college_id=data['college_id'],
                note=data.get('note', '')
            )

            # 2. إضافة منشئ الطلب كـ "طالب" وموافق تلقائياً
            GroupMemberApproval.objects.create(
                request=group_request,
                user=user,
                role='student',
                status='accepted', # المنشئ موافق طبعاً
                responded_at=timezone.now()
            )

            # 3. إضافة بقية الطلاب المدعوين
            for student_id in data.get('student_ids', []):
                if int(student_id) != user.id:
                    member = GroupMemberApproval.objects.create(
                        request=group_request,
                        user_id=student_id,
                        role='student'
                    )
                    # إرسال إشعار للطالب
                    NotificationManager.create_notification(
                        recipient=member.user,
                        notification_type='invitation',
                        title='دعوة انضمام لمجموعة',
                        message=f'دعاك {user.username} للانضمام لمجموعة {group_request.group_name}',
                        related_approval_id=group_request.id # نربط الإشعار بـ ID المسودة
                    )

            # 4. إضافة المشرفين (Supervisors)
            for supervisor_id in data.get('supervisor_ids', []):
                member = GroupMemberApproval.objects.create(
                    request=group_request,
                    user_id=supervisor_id,
                    role='supervisor'
                )
                # إرسال إشعار للمشرف
                NotificationManager.create_notification(
                    recipient=member.user,
                    notification_type='approval_request',
                    title='طلب إشراف على مجموعة',
                    message=f'طلب منك الطالب {user.username} الإشراف على مجموعة {group_request.group_name}',
                    related_approval_id=group_request.id
                )

            # كرر نفس الأمر للمساعدين (co_supervisor_ids) إذا وُجدوا

            return Response({"message": "تم تقديم الطلب بنجاح وهو قيد انتظار موافقة الجميع", "request_id": group_request.id}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)
    

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import GroupMemberApproval, check_and_finalize_group # استيراد الدالة التي وضعناها في المودلز
@api_view(['POST'])
def respond_to_group_request(request, approval_id):
    user = request.user
    # معرفة هل الطلب قبول أم رفض من الرابط
    response_status = 'accepted' if 'approve' in request.path else 'rejected'
    
    from .models import GroupMemberApproval, NotificationLog
    from .models import check_and_finalize_group # تأكد من وجود دالة التفعيل النهائية

    try:
        with transaction.atomic():
            # 1. البحث عن سجل العضوية (approval_id هنا هو ID جدول GroupMemberApproval)
            member_status = get_object_or_404(GroupMemberApproval, id=approval_id, user=user)
            
            if member_status.status != 'pending':
                return Response({"error": "تم الرد مسبقاً"}, status=400)

            # 2. تحديث الحالة
            member_status.status = response_status
            member_status.responded_at = timezone.now()
            member_status.save()

            # 3. تحديث الإشعار ليصبح "مقروء" فعلياً في قاعدة البيانات كما طلبت
            NotificationLog.objects.filter(
                recipient=user, 
                related_id=approval_id,
                notification_type='invitation'
            ).update(is_read=True, read_at=timezone.now())

            # 4. إذا وافق، نتحقق هل اكتملت المجموعة
            if response_status == 'accepted':
                check_and_finalize_group(member_status.request.id)
            
            return Response({"message": "تمت العملية بنجاح"}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ============================================================================================
# Dean Stats View
# ============================================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dean_stats(request):
    """
    Get statistics for dean dashboard - direct row counts from database
    """
    try:
        user = request.user
        print(f"Dean Stats - User: {user.id}, {user.username}")

        # Get dean's college ID - try multiple ways
        dean_college_id = None

        # First try direct affiliation
        try:
            dean_affiliation = AcademicAffiliation.objects.get(user=user)
            dean_college_id = dean_affiliation.college_id
            print(f"Dean Stats - College ID from affiliation: {dean_college_id}")
        except AcademicAffiliation.DoesNotExist:
            print(f"Dean Stats - No direct affiliation found for user {user.id}")

        # If no direct college, try to get it from department affiliation
        if not dean_college_id:
            try:
                dept_affiliation = AcademicAffiliation.objects.filter(user=user, department__isnull=False).first()
                if dept_affiliation and dept_affiliation.department:
                    dean_college_id = dept_affiliation.department.college_id
                    print(f"Dean Stats - College ID from department: {dean_college_id}")
            except Exception as e:
                print(f"Dean Stats - Error getting college from department: {e}")

        if not dean_college_id:
            print(f"Dean Stats - No college ID found for dean user {user.id}")
            return Response({"error": "Dean has no college affiliation"}, status=400)

        # Get counts directly from database with proper filtering
        # First, let's check what roles exist
        all_roles = Role.objects.all().values('type', 'role_type')
        print(f"Dean Stats - All roles in DB: {list(all_roles)}")

        students_count = User.objects.filter(
            academicaffiliation__college_id=dean_college_id,
            userroles__role__type__iexact='student'
        ).distinct().count()

        # Try alternative role field if needed
        if students_count == 0:
            students_count = User.objects.filter(
                academicaffiliation__college_id=dean_college_id,
                userroles__role__role_type__iexact='student'
            ).distinct().count()
            if students_count > 0:
                print("Dean Stats - Used role_type field for students")

        projects_count = Project.objects.filter(
            college_id=dean_college_id
        ).count()

        supervisors_count = User.objects.filter(
            academicaffiliation__college_id=dean_college_id,
            userroles__role__type__iexact='supervisor'
        ).distinct().count()

        if supervisors_count == 0:
            supervisors_count = User.objects.filter(
                academicaffiliation__college_id=dean_college_id,
                userroles__role__role_type__iexact='supervisor'
            ).distinct().count()
            if supervisors_count > 0:
                print("Dean Stats - Used role_type field for supervisors")

        co_supervisors_count = User.objects.filter(
            academicaffiliation__college_id=dean_college_id,
            userroles__role__type__iexact='co_supervisor'
        ).distinct().count()

        if co_supervisors_count == 0:
            co_supervisors_count = User.objects.filter(
                academicaffiliation__college_id=dean_college_id,
                userroles__role__role_type__iexact='co_supervisor'
            ).distinct().count()
            if co_supervisors_count > 0:
                print("Dean Stats - Used role_type field for co_supervisors")

        groups_count = Group.objects.filter(
            department__college_id=dean_college_id
        ).distinct().count()

        print(f"Dean Stats - Counts: students={students_count}, projects={projects_count}, supervisors={supervisors_count}, co_supervisors={co_supervisors_count}, groups={groups_count}")

        # For now, pending approvals is 0 until approval system is implemented
        pending_approvals_count = 0

        return Response({
            "projects": projects_count,
            "supervisors": supervisors_count,
            "coSupervisors": co_supervisors_count,
            "groups": groups_count,
            "pendingApprovals": pending_approvals_count,
            "users": students_count
        })

    except Exception as e:
        print(f"Dean Stats - Error: {str(e)}")
        return Response({"error": str(e)}, status=500)

