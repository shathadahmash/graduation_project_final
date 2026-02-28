from django.test import TestCase

from core.models import (
    City, University, Branch, College, Department,
    Program, Group, Project, ProjectState, programgroup
)
from core.serializers import ProjectSerializer

class UniversityLookupTests(TestCase):
    def setUp(self):
        # minimal chain: City -> University -> Branch -> College -> Department -> Program
        city = City.objects.create(bname_ar='TestCity')
        uni = University.objects.create(uname_ar='TestUni')
        branch = Branch.objects.create(university=uni, city=city)
        college = College.objects.create(branch=branch, name_ar='TestCollege')
        dept = Department.objects.create(college=college, name='TestDept')
        prog = Program.objects.create(p_name='TestProg', department=dept)
        state = ProjectState.objects.create(name='Pending')
        proj = Project.objects.create(title='MyProj', description='desc', state=state)
        grp = Group.objects.create(academic_year='2025', project=proj)
        programgroup.objects.create(program=prog, group=grp)
        self.proj = proj
        self.university = uni

    def test_university_name_property(self):
        self.assertEqual(self.proj.university_name, 'TestUni')

    def test_get_university_returns_instance(self):
        uni = self.proj.get_university()
        self.assertIsNotNone(uni)
        self.assertEqual(uni.uname_ar, 'TestUni')

    def test_serializer_includes_university(self):
        serialized = ProjectSerializer(self.proj)
        self.assertEqual(serialized.data.get('university_name'), 'TestUni')

    def test_serializer_includes_field_and_tools(self):
        # attach field and tools to project and verify serializer output (use ascii text)
        self.proj.field = 'Test Field'
        self.proj.tools = 'tool1, tool2'
        self.proj.save()
        serialized = ProjectSerializer(self.proj)
        self.assertEqual(serialized.data.get('field'), 'Test Field')
        self.assertEqual(serialized.data.get('tools'), 'tool1, tool2')
