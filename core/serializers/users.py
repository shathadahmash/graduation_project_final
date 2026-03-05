from rest_framework import serializers
from core.serializers.location import DepartmentSerializer, CollegeSerializer, UniversitySerializer
from core.models import (
    User, Role, UserRoles, Permission, RolePermission,
    AcademicAffiliation, Student, StudentEnrollmentPeriod
)


# ----------------------------
# User Serializer
# ----------------------------
class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField(read_only=True)
    write_roles = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of role IDs to assign to this user."
    )
    department_id = serializers.SerializerMethodField()
    college_id = serializers.SerializerMethodField()
    staff_profiles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'name',
            'email', 'phone', 'gender', 'CID',
            'roles', 'write_roles', 'department_id', 'college_id', 'staff_profiles'
        ]

    def get_roles(self, obj):
        return list(UserRoles.objects.filter(user=obj).values('role__role_ID', 'role__type'))

    def get_department_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.department.id if affiliation and affiliation.department else None

    def get_college_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.college.id if affiliation and affiliation.college else None

    def get_staff_profiles(self, obj):
        staffs = getattr(obj, 'staff_profiles', None)
        if staffs is None:
            return []
        return StaffSerializer(staffs.all(), many=True, read_only=True).data

    def create(self, validated_data):
        roles_data = validated_data.pop('write_roles', [])

        # Auto-generate username if missing
        if not validated_data.get('username'):
            base_username = f"{validated_data.get('first_name', '')}{validated_data.get('last_name', '')}".lower() or "user"
            counter = 0
            username_candidate = base_username
            while User.objects.filter(username=username_candidate).exists():
                counter += 1
                username_candidate = f"{base_username}{counter}"
            validated_data['username'] = username_candidate

        # Convert empty strings to None
        for field in ['email', 'phone', 'gender', 'CID']:
            if field in validated_data and validated_data[field] == '':
                validated_data[field] = None

        user = super().create(validated_data)

        # Assign roles
        for role_id in roles_data:
            role = Role.objects.filter(role_ID=role_id).first()
            if role:
                UserRoles.objects.get_or_create(user=user, role=role)
        return user

    def update(self, instance, validated_data):
        roles_data = validated_data.pop('write_roles', None)

        # Update fields directly from validated_data
        for attr in ['first_name', 'last_name', 'email', 'phone', 'gender', 'username', 'CID']:
            if attr in validated_data:
                value = validated_data[attr]

                # Special handling for email: allow null
                if attr == 'email':
                    if value == '' or value is None:
                        value = None
                    elif isinstance(value, str):
                        value = value.strip()
                elif attr == 'CID':
                    if value == '' or value is None:
                        value = None
                    elif isinstance(value, str):
                        value = value.strip()
                else:
                    if isinstance(value, str):
                        value = value.strip()

                setattr(instance, attr, value)

        # Keep 'name' in sync if first_name or last_name changed
        instance.name = f"{instance.first_name or ''} {instance.last_name or ''}".strip()
        instance.save()

        # Update roles if provided
        if roles_data is not None:
            # Remove roles not in roles_data
            UserRoles.objects.filter(user=instance).exclude(role__role_ID__in=roles_data).delete()
            # Add missing roles
            for role_id in roles_data:
                role = Role.objects.filter(role_ID=role_id).first()
                if role:
                    UserRoles.objects.get_or_create(user=instance, role=role)

        return instance


# ----------------------------
# User Detail Serializer
# ----------------------------
class UserDetailSerializer(UserSerializer):
    company_name = serializers.SerializerMethodField()
    department_id = serializers.SerializerMethodField()
    college_id = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'company_name',
            'date_joined',
            'department_id',
            'college_id'
        ]

    def get_company_name(self, obj):
        return getattr(obj, 'company_name', None)

    def get_department_id(self, obj):
        if hasattr(obj, 'student_profile') and obj.student_profile.department:
            return obj.student_profile.department.pk
        return None

    def get_college_id(self, obj):
        if hasattr(obj, 'student_profile') and obj.student_profile.college:
            return obj.student_profile.college.pk
        return None

    
class AcademicAffiliationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    college = CollegeSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = AcademicAffiliation
        fields = '__all__'


# ----------------------------
# Role Serializer
# ----------------------------
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_ID', 'type', 'role_type']

    def validate_type(self, value):
        qs = Role.objects.filter(type__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("دور بنفس الاسم موجود بالفعل")
        return value


# ----------------------------
# Permission Serializer
# ----------------------------
class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['perm_ID', 'name', 'Description']


# ----------------------------
# Role Permission Serializer
# ----------------------------
class RolePermissionSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    permission_detail = PermissionSerializer(source='permission', read_only=True)

    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'role_detail', 'permission', 'permission_detail']


# ----------------------------
# User Roles Serializer
# ----------------------------
class UserRolesSerializer(serializers.ModelSerializer):
    user_detail = serializers.StringRelatedField(source='user', read_only=True)
    role_detail = RoleSerializer(source='role', read_only=True)

    class Meta:
        model = UserRoles
        fields = ['id', 'user', 'user_detail', 'role', 'role_detail']


# ----------------------------
# External Company Serializer
# ----------------------------
class ExternalCompanySerializer(serializers.ModelSerializer):
    is_external = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'CID', 'is_external']

    def get_is_external(self, obj):
        return UserRoles.objects.filter(
            user=obj,
            role__type__icontains='External'
        ).exists()


# ----------------------------
# Student Enrollment & Student Serializer
# ----------------------------
class StudentEnrollmentPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentEnrollmentPeriod
        fields = ['id', 'start_date', 'end_date']


class StudentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", default="—", read_only=True)
    username = serializers.CharField(source="user.username", default="—", read_only=True)
    email = serializers.CharField(source="user.email", default="—", read_only=True)
    phone = serializers.CharField(source="user.phone", default="—", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", default=False, read_only=True)

    department_name = serializers.CharField(
        source="department.name", default="—", read_only=True
    )
    college_name = serializers.CharField(
        source="college.name_ar", default="—", read_only=True
    )
    

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'phone', 'gender', 'status', 'enrolled_at',
            'current_academic_year', 'enrollment_periods', 'groups', 'progress'
        ]


# ----------------------------
# Simple User Serializer
# ----------------------------
class SimpleUserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    write_roles = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'name',
                  'email', 'phone', 'gender', 'CID', 'roles', 'write_roles']

    def get_roles(self, obj):
        return list(UserRoles.objects.filter(user=obj).values('role__role_ID', 'role__type'))

    def get_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip()


# ----------------------------
# Staff Serializer
# ----------------------------
class StaffSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = getattr(__import__('core.models', fromlist=['Staff']), 'Staff')
        fields = ['staff_id', 'user', 'role', 'Qualification', 'Office_Hours']

    def get_role(self, obj):
        return obj.role.type if obj.role else None
