from rest_framework import serializers
from core.models import City, University, Branch, College, Department, Program


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['bid', 'bname_ar', 'bname_en']


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['pid', 'p_name', 'department', 'duration']


class DepartmentSerializer(serializers.ModelSerializer):
    programs = ProgramSerializer(source='program_set', many=True, read_only=True)
    # Include college details if needed
    college_detail = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['department_id', 'name', 'description', 'college', 'college_detail', 'programs']

    def get_college_detail(self, obj):
        return {
            'cid': obj.college.cid,
            'name_ar': obj.college.name_ar,
            'name_en': obj.college.name_en
        } if obj.college else None

class CollegeSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(source='department_set', many=True, read_only=True)
    branch_detail = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()  # override description

    class Meta:
        model = College
        fields = ['cid', 'name_ar', 'name_en', 'branch', 'branch_detail', 'description', 'image', 'departments']

    def get_branch_detail(self, obj):
        branch = obj.branch
        if branch:
            return {
                'ubid': branch.ubid,
                'location': branch.location,
                'address': branch.address,
                'contact': branch.contact
            }
        return None

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_description(self, obj):
        # fallback to branch or university description if college description is empty
        if obj.description:
            return obj.description
        if obj.branch and hasattr(obj.branch, 'description') and obj.branch.description:
            return obj.branch.description
        if obj.branch and hasattr(obj.branch, 'university') and obj.branch.university.description:
            return obj.branch.university.description
        return "لا يوجد وصف متاح."


class BranchSerializer(serializers.ModelSerializer):
    university_detail = serializers.SerializerMethodField()
    city_detail = CitySerializer(source='city', read_only=True)
    colleges = CollegeSerializer(source='college_set', many=True, read_only=True)

    class Meta:
        model = Branch
        fields = ['ubid', 'university', 'university_detail', 'city', 'city_detail', 'location', 'address', 'contact', 'colleges']

    def get_university_detail(self, obj):
        university = obj.university
        if university:
            request = self.context.get('request')
            image_url = university.image.url if university.image else None
            if image_url and request:
                image_url = request.build_absolute_uri(image_url)
            return {
                'uid': university.uid,
                'uname_ar': university.uname_ar,
                'uname_en': university.uname_en,
                'type': university.type,
                'image': image_url,
                'description': university.description
            }
        return None


class UniversitySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = ['uid', 'uname_ar', 'uname_en', 'type', 'image', 'description']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None