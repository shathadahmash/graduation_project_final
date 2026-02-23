from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import  api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.http import JsonResponse

from core.models import (
    User, Group, GroupMembers, GroupSupervisors, Project, AcademicAffiliation,
    GroupMemberApproval, NotificationLog, College, Department, UserRoles, Staff, check_and_finalize_group
)
from core.serializers.users import (
     UserSerializer
)


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
        'staff': Staff,
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
    

@api_view(['POST'])
def respond_to_group_request(request, approval_id):
    user = request.user
    # معرفة هل الطلب قبول أم رفض من الرابط
    response_status = 'accepted' if 'approve' in request.path else 'rejected'
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



