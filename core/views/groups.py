from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import  transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from core.models import GroupCreationRequest, Group, GroupMembers, GroupSupervisors
from django.db.models import Q
from rest_framework.decorators import api_view

from core.models import (
    User, Group, GroupMembers, GroupSupervisors,
    Project,GroupCreationRequest, GroupMemberApproval, NotificationLog, 
)
from core.serializers.groups import (
    GroupSerializer, GroupDetailSerializer
)
from core.serializers.approvals import GroupCreateSerializer
from core.permissions import PermissionManager
from core.notification_manager import NotificationManager
# this is added for supervisor group  info 
from core.serializers import SupervisorGroupSerializer 

class SupervisorGroupViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SupervisorGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # ✅ رجّع فقط المجموعات التي هذا المستخدم مشرف عليها
        return (
            Group.objects.filter(
                groupsupervisors__user=user,
                groupsupervisors__type__in=["supervisor", "co_supervisor"]  # أو ["supervisor"] فقط
            )
            .select_related("project", "department")
            .distinct()
        )


# Utility endpoint to ensure client receives CSRF cookie
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})

# till here 

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
                from models import GroupCreationRequest, GroupMemberApproval, NotificationLog
                
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
            from notification_manager import NotificationManager
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
    