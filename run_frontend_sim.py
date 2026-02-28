import os
import django
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'GraduationProjects.settings')

django.setup()
from django.test import Client
from core.models import User

c = Client()

def main():
    dean = User.objects.filter(userroles__role__type__icontains='Dean').first()
    if not dean:
        print('NO_DEAN_USER')
        return
    c.force_login(dean)

    # get affiliations to determine deanCollegeId
    affs_resp = c.get('/api/dropdown-data/')
    # dropdown-data returns students/supervisors/assistants normally; but userService.getAffiliations used in frontend — no direct endpoint
    # We'll fetch academic affiliations raw via bulk-fetch
    resp_aff = c.post('/api/bulk-fetch/', data=json.dumps({'requests':[{'table':'academic_affiliations','fields':['user','college']}]}), content_type='application/json', SERVER_NAME='localhost', HTTP_HOST='localhost')
    affs = resp_aff.json().get('academic_affiliations', []) if resp_aff.status_code==200 else []
    dean_affs = [a for a in affs if a.get('user')==dean.id]
    college_ids = [a.get('college') for a in dean_affs if a.get('college')]
    print('Dean:', dean.id, 'affiliations:', dean_affs, 'college_ids:', college_ids)

    # fetch projects
    resp = c.get('/api/projects/', SERVER_NAME='localhost', HTTP_HOST='localhost')
    print('projects status', resp.status_code)
    projects = resp.json()
    print('projects count', len(projects))

    # bulk fetch groups and related
    req = [
      { 'table':'projects','fields': ['project_id','title','type','state','start_date','end_date','description','field','tools','created_by','Logo','Documentation_Path','college','department'] },
      { 'table':'groups','fields': ['group_id','group_name','project','department'] },
      { 'table':'group_members','fields': ['id','user','group'] },
      { 'table':'group_supervisors','fields': ['id','user','group','type'] },
      { 'table':'users','fields': ['id','first_name','last_name','name'] },
      { 'table':'colleges','fields': ['cid','name_ar'] },
      { 'table':'departments','fields': ['department_id','name','college'] }
    ]
    resp2 = c.post('/api/bulk-fetch/', data=json.dumps({'requests': req}), content_type='application/json', SERVER_NAME='localhost', HTTP_HOST='localhost')
    print('bulk-fetch status', resp2.status_code)
    bulk = resp2.json() if resp2.status_code==200 else {}
    print('bulk keys:', list(bulk.keys()))

    # emulate frontend mapping
    projects_raw = bulk.get('projects', [])
    print('RAW projects value repr:', repr(bulk.get('projects'))[:1000])
    # normalize: bulk may return rows as dicts or repr strings; ensure dicts
    sample_types = []
    try:
        it = iter(projects_raw)
        for i, x in enumerate(it):
            sample_types.append(type(x))
            if i >= 4:
                break
    except TypeError:
        sample_types = [type(projects_raw)]
    print('First project raw type samples:', sample_types)
    # attempt to parse if any element is a JSON string
    cleaned_projects = []
    for idx, item in enumerate(projects_raw):
        if isinstance(item, str):
            print(f'projects_raw[{idx}] sample:', item[:200])
            try:
                cleaned_projects.append(json.loads(item))
            except Exception as e:
                print('Failed to parse project string as JSON:', e)
                # try eval fallback (unsafe but ok for local debugging)
                try:
                    cleaned_projects.append(eval(item))
                except Exception as e2:
                    print('Eval fallback failed:', e2)
                    continue
        else:
            cleaned_projects.append(item)
    projects_raw = cleaned_projects
    groups = bulk.get('groups', [])
    group_members = bulk.get('group_members', [])
    group_supervisors = bulk.get('group_supervisors', [])
    users = bulk.get('users', [])
    colleges = bulk.get('colleges', [])
    departments = bulk.get('departments', [])

    print('counts:', {k: len(v) for k,v in [('projects',projects_raw),('groups',groups),('group_members',group_members),('group_supervisors',group_supervisors),('users',users),('colleges',colleges),('departments',departments)]})

    # find project -> group mapping
    for p in projects_raw:
        pid = p.get('project_id')
        related_groups = [g for g in groups if g.get('project')==pid]
        print('Project', pid, 'related_groups count', len(related_groups))

    # filter by dean college
    deanCollegeId = college_ids[0] if college_ids else None
    print('DeanCollegeId', deanCollegeId)
    matched = []
    # build department lookup
    departments_map = { d.get('department_id'): d for d in departments }
    for p in projects_raw:
        pid = p.get('project_id')
        projectCollege = p.get('college')
        dept_field = p.get('department')
        matches = False

            # direct project college
            if projectCollege and deanCollegeId and int(projectCollege) == int(deanCollegeId):
                matches = True

            # project department field
            if not matches and dept_field:
                try:
                    dept_id = int(dept_field)
                except Exception:
                    dept_id = None
                if dept_id and departments_map.get(dept_id):
                    dept_obj = departments_map.get(dept_id)
                    if dept_obj and dept_obj.get('college') and int(dept_obj.get('college')) == int(deanCollegeId):
                        matches = True

            # fallback: try to find a related group linking this project to a department
            if not matches:
                related_groups = [g for g in groups if g.get('project') == pid]
                if related_groups:
                    main_group = related_groups[0]
                    grp_dept = main_group.get('department')
                    if grp_dept:
                        try:
                            grp_dept_id = int(grp_dept)
                        except Exception:
                            grp_dept_id = None
                        if grp_dept_id and departments_map.get(grp_dept_id):
                            dept_obj = departments_map.get(grp_dept_id)
                            if dept_obj and dept_obj.get('college') and int(dept_obj.get('college')) == int(deanCollegeId):
                                matches = True

            print('Project', pid, 'projectCollege', projectCollege, 'dept_field', dept_field, 'matches', matches)
            if matches:
                matched.append(p)
    print('Matched projects count', len(matched))

if __name__=='__main__':
    main()
