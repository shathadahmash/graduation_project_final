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
    # find a dean user
    dean = User.objects.filter(userroles__role__type__icontains='Dean').first()
    if not dean:
        print('NO_DEAN_USER')
        return
    # login via test client using username (or use force_login)
    c.force_login(dean)
    resp = c.get('/api/projects/', SERVER_NAME='localhost', HTTP_HOST='localhost')
    print('Status:', resp.status_code)
    try:
        data = resp.json()
        print(json.dumps(data, ensure_ascii=False, indent=2))
    except Exception as e:
        print('Non-JSON response, length:', len(resp.content))
        print(resp.content[:1000])

if __name__ == '__main__':
    main()
