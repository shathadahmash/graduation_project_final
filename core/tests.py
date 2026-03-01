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


class LocationAPITests(TestCase):
    """Tests for location view endpoints including college->departments."""

    def setUp(self):
        # build minimal hierarchy
        city = City.objects.create(bname_ar='LocCity')
        uni = University.objects.create(uname_ar='LocUni')
        branch = Branch.objects.create(university=uni, city=city)
        self.college = College.objects.create(branch=branch, name_ar='LocCollege')
        # attach two departments to college
        self.dept1 = Department.objects.create(college=self.college, name='DeptOne')
        self.dept2 = Department.objects.create(college=self.college, name='DeptTwo')
        # set up client with authentication if required
        from rest_framework.test import APIClient
        self.client = APIClient()
        # create a user and authenticate (basic tokenless since IsAuthenticated applies)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.user = User.objects.create_user(username='apiuser', password='pass')
        self.client.force_authenticate(user=self.user)

    def test_college_departments_list(self):
        url = f'/api/colleges/{self.college.id}/departments/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # should return our two departments ordered by name
        names = [d['name'] for d in data]
        self.assertEqual(names, ['DeptOne', 'DeptTwo'])
