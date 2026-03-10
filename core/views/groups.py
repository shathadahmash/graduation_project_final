from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q

from core.models import (   
    User, Group, GroupMembers, GroupSupervisors,
    Project, GroupCreationRequest, GroupMemberApproval,
    NotificationLog, programgroup
)

from core.serializers.groups import (
    GroupProgramSerializer, GroupSerializer, GroupDetailSerializer
)
from core.serializers.approvals import GroupCreateSerializer
from core.permissions import PermissionManager
from core.notification_manager import NotificationManager
from core.serializers import SupervisorGroupSerializer


# Utility endpoint to ensure client receives CSRF cookie
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


class SupervisorGroupViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SupervisorGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Group.objects.filter(
                groupsupervisors__user=user,
                groupsupervisors__type__in=["supervisor", "co_supervisor"]
            )
            .select_related("project")
            .distinct()
        )

import logging
logger = logging.getLogger(__name__)
class GroupViewSet(viewsets.ModelViewSet):
   

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if PermissionManager.is_admin(user):
            return Group.objects.all()

        if PermissionManager.is_supervisor(user):
            return Group.objects.filter(groupsupervisors_set__user=user).distinct()

        if PermissionManager.is_student(user):
            return Group.objects.filter(groupmembers__user=user).distinct()

        return Group.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return GroupCreateSerializer
        if self.action in ['retrieve', 'my_group']:
            return GroupDetailSerializer
        return GroupSerializer

    # ============================
    # 1) Supervisor creates group directly
    # ============================
    @action(detail=False, methods=['post'], url_path='create-by-supervisor', permission_classes=[IsAuthenticated])
    def create_by_supervisor(self, request):
        user = request.user

        if not PermissionManager.is_supervisor(user):
            return Response({"error": "فقط المشرف يمكنه تنفيذ هذا الإجراء"}, status=403)

        data = request.data
        student_ids = data.get("student_ids", [])

        if not student_ids or not isinstance(student_ids, list):
            return Response({"error": "يجب تحديد طالب واحد على الأقل"}, status=400)

        # منع أي طالب من أن يكون في مجموعة أخرى
        existing = GroupMembers.objects.filter(user_id__in=student_ids).values_list("user_id", flat=True)
        existing_ids = list(set(existing))
        if existing_ids:
            taken_students = User.objects.filter(id__in=existing_ids).values("id", "name")
            return Response({
                "error": "بعض الطلاب مرتبطون بالفعل بمجموعة أخرى",
                "students": list(taken_students)
            }, status=400)

        students = list(User.objects.filter(id__in=student_ids))
        if len(students) != len(student_ids):
            return Response({"error": "تحقق من صحة student_ids"}, status=400)

        member_names = [s.name or s.username for s in students]
        members_text = "، ".join(member_names)

        try:
            with transaction.atomic():
                group = Group.objects.create()

                GroupSupervisors.objects.create(user=user, group=group, type='supervisor')

                GroupMembers.objects.bulk_create([
                    GroupMembers(user=s, group=group) for s in students
                ])

                for s in students:
                    NotificationManager.create_notification(
                        recipient=s,
                        notification_type='invitation',
                        title='تمت إضافتك إلى مجموعة',
                        message=f'قام المشرف {user.name or user.username} بإضافتك إلى مجموعة. أعضاء المجموعة: {members_text}',
                        related_group=group
                    )

                return Response({
                    "message": "تم إنشاء المجموعة وإضافة الطلاب بنجاح",
                    "group_id": group.group_id
                }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # ============================
    # 2) Student creates GROUP CREATION REQUEST (pending)
    # ============================
    def create(self, request, *args, **kwargs):
      
        print("DEBUG Incoming group data:", request.data)
        logger.debug(f"Incoming group data: {request.data}")  # 👀 check payload
        dept_id = request.data.get('department_id')
        coll_id = request.data.get('college_id')
        note = request.data.get('note', "")
    
        student_ids = request.data.get('student_ids', [])
        supervisor_ids = request.data.get('supervisor_ids', [])
        co_supervisor_ids = request.data.get('co_supervisor_ids', [])

        if not dept_id or not coll_id:
            return Response({"error": "يرجى التأكد من إرسال القسم، والكلية"},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                group_req = GroupCreationRequest.objects.create(
                    creator=request.user,
                    department_id=dept_id,
                    college_id=coll_id,
                    note=note,
                    is_fully_confirmed=False
                )

                def process_invitations(user_ids, role_name):
                    for u_id in user_ids:
                        if not u_id:
                            continue

                        is_creator = int(u_id) == request.user.id

                        approval = GroupMemberApproval.objects.create(
                            request=group_req,
                            user_id=u_id,
                            role=role_name,
                            status='accepted' if is_creator else 'pending',
                            responded_at=timezone.now() if is_creator else None
                        )

                        if not is_creator:
                            NotificationLog.objects.create(
                                recipient_id=u_id,
                                notification_type='invitation',
                                title="دعوة انضمام لمجموعة",
                                message=f"دعاك {request.user.name or request.user.username} لطلب مجموعة رقم: {group_req.id}",
                                related_id=approval.id
                            )

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

    # ============================
    # 3) Add member to OFFICIAL group (admin/supervisor)
    # ============================
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        if not PermissionManager.can_manage_group(request.user):
            return Response({"error": "ليس لديك صلاحية إدارة المجموعة"}, status=status.HTTP_403_FORBIDDEN)

        group = self.get_object()
        student_ids = request.data.get('student_ids', [])
        for sid in student_ids:
            u = get_object_or_404(User, id=sid)
            GroupMembers.objects.get_or_create(user=u, group=group)

        return Response({"message": "تم إضافة الأعضاء بنجاح"})

    @action(detail=True, methods=['post'])
    def add_supervisor(self, request, pk=None):
        if not PermissionManager.is_admin(request.user):
            return Response({"error": "فقط الإدارة يمكنها تعيين مشرفين"}, status=status.HTTP_403_FORBIDDEN)

        group = self.get_object()
        supervisor_id = request.data.get('supervisor_id')
        supervisor = get_object_or_404(User, id=supervisor_id)
        GroupSupervisors.objects.get_or_create(user=supervisor, group=group)

        return Response({"message": "تم إضافة المشرف بنجاح"})

    # ============================
    # 4) my-group endpoint (Student page)
    # ============================
    @action(detail=False, methods=['get'], url_path='my-group')
    def my_group(self, request):
        user = request.user

        try:
            membership = GroupMembers.objects.filter(user=user).select_related('group', 'group__project').first()

            if membership:
                group_obj = membership.group
                members_list = GroupMembers.objects.filter(group=group_obj).select_related('user')
                supervisors_list = GroupSupervisors.objects.filter(group=group_obj).select_related('user')

                creator_member = (
                    GroupMembers.objects
                    .filter(group=group_obj)
                    .select_related("user")
                    .order_by("id")
                    .first()
                )
                creator_name = (
                    (creator_member.user.name or creator_member.user.username)
                    if creator_member else "مجموعة"
                )

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
                        "role": "supervisor",
                        "created_at": None
                    })

                return Response([{
                    "id": group_obj.group_id,
                    "group_id": group_obj.group_id,

                    # ✅ keep key for frontend; value is creator name
                    # "display_name": creator_name,

                    "is_official_group": True,
                    "is_pending": False,
                    "user_role_in_pending_request": "creator",

                    "project_detail": {
                        "project_id": group_obj.project.project_id if group_obj.project else None,
                        "title": group_obj.project.title if group_obj.project else "لم يحدد",
                        "state": group_obj.project.state.name if (group_obj.project and group_obj.project.state) else "Unknown"
                    },

                    "members": [{"user_detail": {"name": m.user.name or m.user.username}} for m in members_list],
                    "supervisors": [{"user_detail": {"name": s.user.name or s.user.username}, "type": s.type} for s in supervisors_list],
                    "approvals": approvals_data,
                    "members_count": members_list.count()
                }])

            # Pending creation requests (draft)
            creation_requests = GroupCreationRequest.objects.filter(
                Q(creator=user) | Q(approvals__user=user)
            ).filter(is_fully_confirmed=False).distinct().order_by('-created_at')

            if creation_requests.exists():
                serializer = GroupDetailSerializer(creation_requests, many=True)
                data_list = serializer.data

                for data, request_obj in zip(data_list, creation_requests):
                    data['is_official_group'] = False
                    data['is_pending'] = True
                    data['user_role_in_pending_request'] = 'creator' if request_obj.creator == user else 'invited'


                return Response(data_list)

            return Response([{
                "is_official_group": False,
                "is_pending": False,
                "user_role_in_pending_request": "none"
            }])

        except Exception as e:
            print(f"CRITICAL ERROR: {str(e)}")
            return Response({"error": str(e)}, status=500)

    # ============================
    # 5) Send individual invite for PENDING request
    # ============================
    @action(detail=True, methods=['post'], url_path='send-individual-invite')
    def send_individual_invite(self, request, pk=None):
        group_creation_req = get_object_or_404(GroupCreationRequest, id=pk)
        target_user_id = request.data.get('user_id')
        role = request.data.get('role', 'student')

        if int(target_user_id) == request.user.id:
            return Response({"error": "لا يمكنك دعوة نفسك"}, status=400)

        with transaction.atomic():
            member_status, created = GroupMemberApproval.objects.update_or_create(
                request=group_creation_req,
                user_id=target_user_id,
                defaults={'role': role, 'status': 'pending'}
            )

            NotificationLog.objects.filter(recipient_id=target_user_id, related_id=member_status.id).delete()

            NotificationLog.objects.create(
                recipient_id=target_user_id,
                notification_type='invitation',
                title='دعوة جديدة',
                message=f'تمت دعوتك للانضمام لطلب مجموعة رقم {group_creation_req.id}',
                related_id=member_status.id
            )

        return Response({"message": "تم إرسال الدعوة"}, status=201)

    # ============================
    # 6) link project to group
    # ============================
    @action(detail=True, methods=['post'], url_path='link-project')
    def link_project(self, request, pk=None):
        group = self.get_object()
        project_id = request.data.get('project_id')
        project = get_object_or_404(Project, project_id=project_id)

        # NOTE: your Project.state is a FK to ProjectState in models
        # So comparing with 'Accepted' string may be wrong depending on your implementation.
        # Keep as-is if it's working in your DB.

        group.project = project
        group.save()

        return Response({"message": "تم ربط المشروع بنجاح"})


@api_view(['POST'])
def submit_group_creation_request(request):
 
    data = request.data
    user = request.user

    try:
        with transaction.atomic():
            group_request = GroupCreationRequest.objects.create(
                creator=user,
                department_id=data['department_id'],
                college_id=data['college_id'],
                note=data.get('note', '')
            )

            GroupMemberApproval.objects.create(
                request=group_request,
                user=user,
                role='student',
                status='accepted',
                responded_at=timezone.now()
            )

            for student_id in data.get('student_ids', []):
                if int(student_id) != user.id:
                    member = GroupMemberApproval.objects.create(
                        request=group_request,
                        user_id=student_id,
                        role='student'
                    )
                    NotificationManager.create_notification(
                        recipient=member.user,
                        notification_type='invitation',
                        title='دعوة انضمام لمجموعة',
                        message=f'دعاك {user.username} لطلب مجموعة رقم {group_request.id}',
                        related_approval_id=group_request.id
                    )

            for supervisor_id in data.get('supervisor_ids', []):
                member = GroupMemberApproval.objects.create(
                    request=group_request,
                    user_id=supervisor_id,
                    role='supervisor'
                )
                NotificationManager.create_notification(
                    recipient=member.user,
                    notification_type='approval_request',
                    title='طلب إشراف على مجموعة',
                    message=f'طلب منك الطالب {user.username} الإشراف على طلب مجموعة رقم {group_request.id}',
                    related_approval_id=group_request.id
                )

            return Response({
                "message": "تم تقديم الطلب بنجاح وهو قيد انتظار موافقة الجميع",
                "request_id": group_request.id
            }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


class GroupProgramViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GroupProgramSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return programgroup.objects.all()