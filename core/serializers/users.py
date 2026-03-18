from rest_framework import serializers
from core.serializers.location import DepartmentSerializer, CollegeSerializer, ProgramSerializer, UniversitySerializer
from core.models import (
    User, Role, UserRoles, Permission, RolePermission,
    AcademicAffiliation, Student, StudentEnrollmentPeriod
)

ROLE_CONFLICTS = {
  'Student': [
    'Supervisor',
    'CO-Supervisor',
    'Department Head',
    'Dean',
    'Admin',
    'System Manager',
    'University President',
    'External Company',
    'Ministry'
  ],

  'Supervisor': [
    'Student',
    'External Company',
    'Ministry'
  ],

  'CO-Supervisor': [
    'Student',
    'External Company',
    'Ministry'
  ],

  'Department Head': [
    'Student',
    'External Company',
    'Ministry'
  ],

  'Dean': [
    'Student',
    'External Company',
    'Ministry'
  ],

  'External Company': [
    'Student',
    'Supervisor',
    'CO-Supervisor',
    'Department Head',
    'Dean',
    'University President'
  ],

  'Ministry': [
    'Student',
    'Supervisor',
    'CO-Supervisor',
    'Department Head',
    'Dean'
  ]
}
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
    
    def get_program_id(self, obj):
        affiliation = getattr(obj, 'academicaffiliation', None)
        return affiliation.program.id if affiliation and affiliation.program else None

    def get_staff_profiles(self, obj):
        staffs = getattr(obj, 'staff_profiles', None)
        if staffs is None:
            return []
        return StaffSerializer(staffs.all(), many=True, read_only=True).data

    # ----------------------------
    # VALIDATE ROLE CONFLICTS
    # ----------------------------
    def validate_write_roles(self, role_ids):
        roles = Role.objects.filter(role_ID__in=role_ids)
        role_types = [r.type for r in roles]

        for r1 in role_types:
            for r2 in role_types:
                if r1 == r2:
                    continue
                if r2 in ROLE_CONFLICTS.get(r1, []):
                    raise serializers.ValidationError(
                        f"Role conflict: '{r1}' cannot be combined with '{r2}'."
                    )
        return role_ids

    # ----------------------------
    # CREATE USER
    # ----------------------------
    def create(self, validated_data):
        roles_data = validated_data.pop('write_roles', [])
        # validate roles for conflicts
        self.validate_write_roles(roles_data)

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

    # ----------------------------
    # UPDATE USER
    # ----------------------------
    def update(self, instance, validated_data):
        roles_data = validated_data.pop('write_roles', None)
        # validate roles for conflicts
        if roles_data is not None:
            self.validate_write_roles(roles_data)

        # Update fields directly from validated_data
        for attr in ['first_name', 'last_name', 'email', 'phone', 'gender', 'username', 'CID']:
            if attr in validated_data:
                value = validated_data[attr]

                # Special handling for email & CID
                if attr in ['email', 'CID']:
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
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['company_name', 'date_joined']


# ----------------------------
# Academic Affiliation Serializer
# ----------------------------
class AcademicAffiliationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    college = CollegeSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    program = ProgramSerializer(read_only=True)

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

    user = UserDetailSerializer(read_only=True)
    enrollment_periods = StudentEnrollmentPeriodSerializer(many=True, read_only=True)

    current_academic_year = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    name = serializers.CharField(write_only=True, required=False)
    email = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)

    username = serializers.CharField(source="user.username", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    college_name = serializers.CharField(source="college.name_ar", read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'user', 'student_id', 'phone', 'gender', 'status', 'enrolled_at',
            'current_academic_year', 'enrollment_periods', 'groups', 'progress'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["name"] = instance.user.name if instance.user else ""
        data["email"] = instance.user.email if instance.user else ""
        data["phone"] = instance.user.phone if instance.user else ""
        return data

    def update(self, instance, validated_data):
        name = validated_data.pop("name", None)
        email = validated_data.pop("email", None)
        phone = validated_data.pop("phone", None)

        # تحديث Student
        instance.status = validated_data.get("status", instance.status)
        instance.save()

        # تحديث User
        user = instance.user
        if user:
            if name is not None:
                user.name = name
            if email is not None:
                user.email = email
            if phone is not None:
                user.phone = phone
            user.save()

        return instance
    # هذه الدالة لحقل current_academic_year
    def get_current_academic_year(self, obj):
        return ""

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

    # هذه الدالة لحقل progress
    def get_progress(self, obj):
        return []
    
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
class StudentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False)
    email = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)

    username = serializers.CharField(source="user.username", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    college_name = serializers.CharField(source="college.name_ar", read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "student_id",
            "name",
            "username",
            "email",
            "phone",
            "is_active",
            "status",
            "current_academic_year",
            "department_name",
            "college_name",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["name"] = instance.user.name if instance.user else ""
        data["email"] = instance.user.email if instance.user else ""
        data["phone"] = instance.user.phone if instance.user else ""
        return data

    def update(self, instance, validated_data):
        name = validated_data.pop("name", None)
        email = validated_data.pop("email", None)
        phone = validated_data.pop("phone", None)

        # تحديث Student
        instance.status = validated_data.get("status", instance.status)
        instance.save()

        # تحديث User
        user = instance.user
        if user:
            if name is not None:
                user.name = name
            if email is not None:
                user.email = email
            if phone is not None:
                user.phone = phone
            user.save()

        return instance
    # هذه الدالة لحقل current_academic_year
    def get_current_academic_year(self, obj):
        return ""

    # هذه الدالة لحقل groups
    def get_groups(self, obj):
        return []

    # هذه الدالة لحقل progress
    def get_progress(self, obj):
        return []
    