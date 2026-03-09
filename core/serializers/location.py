#######        content section       ########
# CitySerializer
# UniversitySerializer
# BranchSerializer
# CollegeSerializer
# DepartmentSerializer
# ProgramSerializer

from rest_framework import serializers
from core.models import (
    City, University, Branch, College, Department, Program,
)


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['bid', 'bname_ar', 'bname_en']


class UniversitySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = University
        fields = ['uid', 'uname_ar', 'uname_en', 'type', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class BranchSerializer(serializers.ModelSerializer):
    university_detail = UniversitySerializer(source='university', read_only=True)
    city_detail = CitySerializer(source='city', read_only=True)

    class Meta:
        model = Branch
        fields = [
            'ubid',
            'university', 'university_detail',
            'city', 'city_detail',
            'location', 'address', 'contact'
        ]


class CollegeSerializer(serializers.ModelSerializer):
    branch_detail = BranchSerializer(source='branch', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = College
        fields = [
            'cid',
            'name_ar',
            'name_en',
            'branch',
            'branch_detail',
            'image'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class DepartmentSerializer(serializers.ModelSerializer):
    college_detail = CollegeSerializer(source='college', read_only=True)

    class Meta:
        model = Department
        fields = [
            'department_id', 'name', 'description', 'college', 'college_detail'
        ]

class ProgramSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)

    class Meta:
        model = Program
        fields = ['pid', 'p_name', 'department', 'duration', 'department_detail']
