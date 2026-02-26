from rest_framework import serializers
from django.utils import timezone
import json
from django.db import transaction
from core.serializers.users import UserSerializer
from core.serializers.groups import GroupSerializer
from core.models import (
    College, Department, User, 
    Project, ApprovalRequest,NotificationLog, 
    GroupCreationRequest,  GroupMemberApproval
)

class ApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by_detail = UserSerializer(source='requested_by', read_only=True)
    current_approver_detail = UserSerializer(source='current_approver', read_only=True)
    group_detail = GroupSerializer(source='group', read_only=True)
    
    class Meta:
        model = ApprovalRequest
        fields = [
            'approval_id', 'approval_type', 'group', 'group_detail', 'project',
            'requested_by', 'requested_by_detail', 'current_approver',
            'current_approver_detail', 'approval_level', 'status', 'comments',
            'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = ['approval_id', 'created_at', 'updated_at', 'approved_at']

# this commented to start fixing the notifications after the seperations
# class GroupCreateSerializer(serializers.Serializer):
#     # حقول المجموعة
#     group_name = serializers.CharField(max_length=255)
#     student_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
#     supervisor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
#     co_supervisor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
#     department_id = serializers.IntegerField(required=True)
#     college_id = serializers.IntegerField(required=True)
#     note = serializers.CharField(required=False, allow_blank=True, default='')

#     # حقول المشروع (تم دمجها من النسخة الأولى)
#     project_title = serializers.CharField(max_length=500)
#     project_type = serializers.CharField(max_length=100)
#     project_description = serializers.CharField()

#     def validate(self, data):
#         MAX_STUDENTS, MAX_SUPERVISORS, MAX_CO_SUPERVISORS = 5, 3, 2
        
#         # التحقق من الأعداد
#         if len(data['student_ids']) > MAX_STUDENTS:
#             raise serializers.ValidationError(f"الحد الأقصى للطلاب هو {MAX_STUDENTS}")
#         if len(data.get('supervisor_ids', [])) > MAX_SUPERVISORS:
#             raise serializers.ValidationError(f"الحد الأقصى للمشرفين هو {MAX_SUPERVISORS}")
#         if len(data.get('co_supervisor_ids', [])) > MAX_CO_SUPERVISORS:
#             raise serializers.ValidationError(f"الحد الأقصى للمشرفين المساعدين هو {MAX_CO_SUPERVISORS}")

#         # التحقق من عدم التكرار والوجود
#         all_ids = data['student_ids'] + data.get('supervisor_ids', []) + data.get('co_supervisor_ids', [])
#         if len(all_ids) != len(set(all_ids)):
#             raise serializers.ValidationError("يجب أن تكون قائمة الأعضاء والمشرفين فريدة")
            
#         if User.objects.filter(id__in=all_ids).count() != len(all_ids):
#             raise serializers.ValidationError("بعض معرفات المستخدمين غير صحيحة")

#         # التحقق من القسم والكلية
#         try:
#             Department.objects.get(department_id=data['department_id'])
#             College.objects.get(cid=data['college_id'])
#         except (Department.DoesNotExist, College.DoesNotExist):
#             raise serializers.ValidationError("القسم أو الكلية غير صالحة")

#         # التحقق من أن المنشئ ضمن الطلاب
#         request = self.context.get('request')
#         if request and request.user.id not in data['student_ids']:
#             raise serializers.ValidationError("يجب أن يكون الطالب المنشئ ضمن قائمة الطلاب")

#         return data
    

#     def create(self, validated_data):
       
      
       
        
#         requested_by = self.context['request'].user

#         with transaction.atomic():
#             # 1. إنشاء المشروع أولاً
#             project = Project.objects.create(
#                 title=validated_data['project_title'],
#                 type=validated_data['project_type'],
#                 description=validated_data['project_description'],
#                 start_date=timezone.now().date(),
#                 state='Pending Approval'
#             )

#             # 2. إنشاء طلب المجموعة الرئيسي مرتبطاً بالمشروع
#             group_request = GroupCreationRequest.objects.create(
#                 group_name=validated_data['group_name'],
#                 creator=requested_by,
#                 department_id=validated_data['department_id'],
#                 college_id=validated_data['college_id'],
#                 project=project,  # ربط المشروع بطلب المجموعة
#                 note=validated_data.get('note', '')
#             )

#             # 3. معالجة المشاركين (طلاب، مشرفين، مساعدين)
#             participants = []
#             for s_id in validated_data.get('student_ids', []): participants.append({'id': s_id, 'role': 'student'})
#             for s_id in validated_data.get('supervisor_ids', []): participants.append({'id': s_id, 'role': 'supervisor'})
#             for s_id in validated_data.get('co_supervisor_ids', []): participants.append({'id': s_id, 'role': 'co_supervisor'})

#             for person in participants:
#                 p_id = int(person['id'])
#                 is_creator = (p_id == requested_by.id)
                
#                 # إنشاء سجل العضوية والموافقة
#                 member_status = GroupMemberApproval.objects.create(
#                     request=group_request,
#                     user_id=p_id,
#                     role=person['role'],
#                     status='accepted' if is_creator else 'pending'
#                 )

#                 # إرسال إشعار دعوة للبقية
#                 if not is_creator:
#                     NotificationLog.objects.create(
#                         recipient_id=p_id,
#                         notification_type='invitation',
#                         title='دعوة انضمام للمجموعة',
#                         message=f'قام {requested_by.name} بدعوتك لمجموعة {group_request.group_name}',
#                         related_id=member_status.id 
#                     )

#             # 4. إنشاء طلب الاعتماد الرسمي (ApprovalRequest) لربط العملية بالنظام الإداري
#             # يتم تخزين بيانات المجموعة في حقل comments كنسخة احتياطية
#             group_summary = {
#                 'group_name': validated_data['group_name'],
#                 'student_ids': validated_data['student_ids'],
#                 'department_id': validated_data['department_id'],
#             }
            
#             ApprovalRequest.objects.create(
#                 approval_type='project_proposal',
#                 project=project,
#                 requested_by=requested_by,
#                 current_approver=None, # يتم تحديده لاحقاً بناءً على سير العمل
#                 comments=json.dumps(group_summary),
#                 status='pending'
#             )

#             return group_request


class GroupCreateSerializer(serializers.Serializer):
    student_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
    supervisor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    co_supervisor_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    department_id = serializers.IntegerField(required=True)
    college_id = serializers.IntegerField(required=True)
    note = serializers.CharField(required=False, allow_blank=True, default='')

    project_title = serializers.CharField(max_length=500)
    project_type = serializers.CharField(max_length=100)
    project_description = serializers.CharField()

    def validate(self, data):
        MAX_STUDENTS, MAX_SUPERVISORS, MAX_CO_SUPERVISORS = 5, 3, 2

        if len(data['student_ids']) > MAX_STUDENTS:
            raise serializers.ValidationError(f"الحد الأقصى للطلاب هو {MAX_STUDENTS}")
        if len(data.get('supervisor_ids', [])) > MAX_SUPERVISORS:
            raise serializers.ValidationError(f"الحد الأقصى للمشرفين هو {MAX_SUPERVISORS}")
        if len(data.get('co_supervisor_ids', [])) > MAX_CO_SUPERVISORS:
            raise serializers.ValidationError(f"الحد الأقصى للمشرفين المساعدين هو {MAX_CO_SUPERVISORS}")

        all_ids = data['student_ids'] + data.get('supervisor_ids', []) + data.get('co_supervisor_ids', [])
        if len(all_ids) != len(set(all_ids)):
            raise serializers.ValidationError("يجب أن تكون قائمة الأعضاء والمشرفين فريدة")

        if User.objects.filter(id__in=all_ids).count() != len(all_ids):
            raise serializers.ValidationError("بعض معرفات المستخدمين غير صحيحة")

        try:
            Department.objects.get(department_id=data['department_id'])
            College.objects.get(cid=data['college_id'])
        except (Department.DoesNotExist, College.DoesNotExist):
            raise serializers.ValidationError("القسم أو الكلية غير صالحة")

        request = self.context.get('request')
        if request and request.user.id not in data['student_ids']:
            raise serializers.ValidationError("يجب أن يكون الطالب المنشئ ضمن قائمة الطلاب")

        return data

    def create(self, validated_data):
        requested_by = self.context['request'].user

        with transaction.atomic():
            project = Project.objects.create(
                title=validated_data['project_title'],
                type=validated_data['project_type'],
                description=validated_data['project_description'],
                start_date=timezone.now().date(),
                state='Pending Approval'
            )

            group_request = GroupCreationRequest.objects.create(
                creator=requested_by,
                department_id=validated_data['department_id'],
                college_id=validated_data['college_id'],
                project=project,
                note=validated_data.get('note', '')
            )

            participants = []
            for s_id in validated_data.get('student_ids', []): participants.append({'id': s_id, 'role': 'student'})
            for s_id in validated_data.get('supervisor_ids', []): participants.append({'id': s_id, 'role': 'supervisor'})
            for s_id in validated_data.get('co_supervisor_ids', []): participants.append({'id': s_id, 'role': 'co_supervisor'})

            for person in participants:
                p_id = int(person['id'])
                is_creator = (p_id == requested_by.id)

                member_status = GroupMemberApproval.objects.create(
                    request=group_request,
                    user_id=p_id,
                    role=person['role'],
                    status='accepted' if is_creator else 'pending'
                )

                if not is_creator:
                    NotificationLog.objects.create(
                        recipient_id=p_id,
                        notification_type='invitation',
                        title='دعوة انضمام للمجموعة',
                        message=f'قام {requested_by.name} بدعوتك للانضمام إلى مجموعة مشروع: {project.title}',
                        related_id=member_status.id
                    )

            group_summary = {
                'student_ids': validated_data['student_ids'],
                'department_id': validated_data['department_id'],
                'project_title': validated_data['project_title'],
            }

            ApprovalRequest.objects.create(
                approval_type='project_proposal',
                project=project,
                requested_by=requested_by,
                current_approver=None,
                comments=json.dumps(group_summary),
                status='pending'
            )

            return group_request