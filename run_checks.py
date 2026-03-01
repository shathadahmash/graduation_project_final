import os
import django
import json
import sys

# Ensure we're running from the project root
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'GraduationProjects.settings')

django.setup()

from core.models import User, Role, UserRoles, AcademicAffiliation, Group
from core.serializers.groups import GroupSerializer


def main():
    try:
        dean_users = User.objects.filter(userroles__role__type__icontains='Dean').distinct()
        if not dean_users.exists():
            print('NO_DEAN_USERS_FOUND')
            return

        user = dean_users.first()
        print('Using dean user:', user.id, user.name or user.username)

        college_ids = list(AcademicAffiliation.objects.filter(user=user).values_list('college_id', flat=True))
        college_ids = [c for c in college_ids if c]
        print('Affiliated college_ids:', college_ids)

        if not college_ids:
            print('DEAN_HAS_NO_COLLEGES')
            return

        groups_qs = Group.objects.filter(program_groups__program__department__college__in=college_ids).distinct()
        print('Groups count for dean:', groups_qs.count())

        ser = GroupSerializer(groups_qs, many=True)
        print(json.dumps({'count': groups_qs.count(), 'groups': ser.data}, ensure_ascii=False, indent=2))

    except Exception as e:
        print('ERROR:', str(e))

if __name__ == '__main__':
    main()
