#####        content         #####
# UserSerializer
# UserDetailSerializer
# AcademicAffiliationSerializer
# RoleSerializer
# PermissionSerializer
# RolePermissionSerializer
# UserRolesSerializer


from rest_framework import serializers
from core.serializers.location import(
DepartmentSerializer,
CollegeSerializer,
UniversitySerializer
)
from core.models import (
    User, Role, UserRoles, Permission, RolePermission,
      AcademicAffiliation,Student, StudentEnrollmentPeriod
)



class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    department_id = serializers.SerializerMethodField()
    college_id = serializers.SerializerMethodField()
    staff_profiles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'phone', 'gender', 'roles', 'department_id', 'college_id', 'staff_profiles']

    def get_roles(self, obj):
        return list(UserRoles.objects.filter(user=obj).values('role__role_ID', 'role__type'))

    def get_department_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.department.id if affiliation and affiliation.department else None

    def get_college_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.college.id if affiliation and affiliation.college else None

    def get_staff_profiles(self, obj):
        staffs = obj.staff_profiles.all() if hasattr(obj, 'staff_profiles') else []
        # import here to avoid circular import at module import time
        try:
            from core.serializers.users import StaffSerializer
            return StaffSerializer(staffs, many=True, read_only=True).data
        except Exception:
            return [
                {
                    'staff_id': s.staff_id,
                    'role': getattr(s.role, 'type', None),
                    'Qualification': s.Qualification,
                    'Office_Hours': s.Office_Hours,
                }
                for s in staffs
            ]


class UserDetailSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['company_name', 'date_joined']


class AcademicAffiliationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    college = CollegeSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = AcademicAffiliation
        fields = '__all__'



class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_ID', 'type', 'role_type']

    def validate_type(self, value):
        # Prevent duplicate role names (case-insensitive)
        qs = Role.objects.filter(type__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("دور بنفس الاسم موجود بالفعل")
        return value


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['perm_ID', 'name', 'Description']


class RolePermissionSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    permission_detail = PermissionSerializer(source='permission', read_only=True)

    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'role_detail', 'permission', 'permission_detail']


class UserRolesSerializer(serializers.ModelSerializer):
    user_detail = serializers.StringRelatedField(source='user', read_only=True)
    role_detail = RoleSerializer(source='role', read_only=True)

    class Meta:
        model = UserRoles
        fields = ['id', 'user', 'user_detail', 'role', 'role_detail']

class ExternalCompanySerializer(serializers.ModelSerializer):
    is_external = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'email', 'is_external']

    def get_is_external(self, obj):
        return UserRoles.objects.filter(
            user=obj,
            role__type__icontains='External'
        ).exists()

class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = getattr(__import__('core.models', fromlist=['Staff']), 'Staff')
        fields = ['staff_id', 'user', 'role', 'Qualification', 'Office_Hours']
class StudentEnrollmentPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentEnrollmentPeriod
        fields = ['id', 'start_date', 'end_date']
class StudentSerializer(serializers.ModelSerializer):
    user = UserDetailSerializer(read_only=True)
    enrollment_periods = StudentEnrollmentPeriodSerializer(many=True, read_only=True)

    current_academic_year = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id',
            'user',
            'student_id',
            'phone',
            'gender',
            'status',
            'enrolled_at',
            'current_academic_year',
            'enrollment_periods',
            'groups',
            'progress'
        ]