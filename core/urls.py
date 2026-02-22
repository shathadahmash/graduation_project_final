from django.urls import path, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from rest_framework.routers import DefaultRouter
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from core.views import (
    RoleViewSet,
    UserViewSet,
    GroupViewSet,
    GroupInvitationViewSet,
    ProjectViewSet,
    ApprovalRequestViewSet,
    NotificationViewSet,
    UserRolesViewSet,
    bulk_fetch,
    respond_to_group_request,
    dean_stats,
    SupervisorGroupViewSet,
    dropdown_data,
)
from core.views.groups import GroupProgramViewSet

from .views import get_csrf_token

# إنشاء router واحد فقط
router = DefaultRouter()
router.register(r'supervisor/groups', SupervisorGroupViewSet, basename='supervisor-groups')  # ✅ route جديد
router.register(r'users', UserViewSet, basename='user')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'invitations', GroupInvitationViewSet, basename='invitation')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'approvals', ApprovalRequestViewSet, basename='approval')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-roles', UserRolesViewSet, basename='userrole')
router.register(r'groupprogram', GroupProgramViewSet, basename='groupprogram')

urlpatterns = [
    path('approvals/<int:approval_id>/approve/', respond_to_group_request, name='approval-approve'),
    path('approvals/<int:approval_id>/reject/', respond_to_group_request, name='approval-reject'),
    
    # API Endpoints
    path('', include(router.urls)),   # ✅ هنا يشمل كل الـ routes بما فيها supervisor/groups
    path('dropdown-data/', dropdown_data, name='dropdown-data'),
    path('bulk-fetch/', bulk_fetch, name='bulk-fetch'),
    path('dean-stats/', dean_stats, name='dean-stats'),

    # Endpoint to set CSRF cookie for SPA clients
    path('csrf/', get_csrf_token, name='get-csrf'),

    # Custom Approval Actions
    path('approvals/<int:pk>/approve/', ApprovalRequestViewSet.as_view({'post': 'approve'}), name='approval-approve'),
    path('approvals/<int:pk>/reject/', ApprovalRequestViewSet.as_view({'post': 'reject'}), name='approval-reject'),

    # Template Views
    path('groups/', login_required(TemplateView.as_view(template_name='core/groups.html')), name='groups'),
    path('invitations/', login_required(TemplateView.as_view(template_name='core/invitations.html')), name='invitations'),
    path('approvals/', login_required(TemplateView.as_view(template_name='core/approvals.html')), name='approvals'),
]
