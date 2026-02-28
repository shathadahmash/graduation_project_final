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
    resp = c.get('/api/program-groups/?group_id=14', SERVER_NAME='localhost', HTTP_HOST='localhost')
    print('Status:', resp.status_code)
    try:
        print(json.dumps(resp.json(), ensure_ascii=False, indent=2))
    except Exception:
        print('Non-JSON response length:', len(resp.content))

if __name__ == '__main__':
    main()
