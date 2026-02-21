# You are using __init__.py as a public API for the serializers package.
# Think of it like:
# A barrel file (if you know TypeScript)
# Without __init__.py Exports (Bad DX)
# In views:
# from core.serializers.groups import GroupSerializer
# from core.serializers.users import UserSerializer
# from core.serializers.approvals import GroupCreateSerializer
# Problems:
# Long imports
# Hard to refactor
# Messy code
# Everyone imports differently

from .location import *
from .users import *
from .groups import *
from .projects import *
from .invitations import *
from .approvals import *
from .notifications import *
