from django.urls import path, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from rest_framework.routers import DefaultRouter
from django.conf.urls.static import static
from GraduationProjects import settings

# Import views
from .views.import_views import import_users_validate, import_users_commit
from .views.import_projects import (
    import_projects_commit,
    import_projects_template,
    import_projects_validate
)

from .views import get_csrf_token
from .views import ProjectRatingViewSet


from core.views.ImportStudents import (
    import_students_commit,
    import_students_template,
    import_students_validate,
)
from core.views.groups import GroupProgramViewSet
from core.views.location_views import (
    BranchViewSet,
    CollegeDepartmentsView,
    CollegeProgramsView,
    DepartmentViewSet,
    FetchRelatedToUniversity,
    UniversityViewSet,
    universitycollegeviewset,
    ProgramViewSet
)

from core.views import (
    RoleViewSet,
    UserViewSet,
    StaffViewSet,
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
    CollegeViewSet,
    BranchViewSet,
    StudentViewSet,
    CityViewSet
)

# =========================
# Router
# =========================

router = DefaultRouter()

router.register(r'supervisor/groups', SupervisorGroupViewSet, basename='supervisor-groups')
router.register(r'users', UserViewSet, basename='user')
router.register(r'staff', StaffViewSet, basename='staff')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'universities', UniversityViewSet, basename='universities')
router.register(r'programs', ProgramViewSet, basename='programs')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'invitations', GroupInvitationViewSet, basename='invitation')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'approvals', ApprovalRequestViewSet, basename='approval')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-roles', UserRolesViewSet, basename='userrole')
router.register(r'groupprogram', GroupProgramViewSet, basename='groupprogram')
router.register(r'program-groups', GroupProgramViewSet, basename='program-groups')
router.register(r'colleges', CollegeViewSet, basename='colleges')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'branches', BranchViewSet, basename='branches')
router.register(r'university-colleges', universitycollegeviewset, basename='university-colleges')
router.register(r'students', StudentViewSet, basename='students')
router.register(r'cities', CityViewSet, basename='cities')
router.register(r'ratings', ProjectRatingViewSet)

router.register(
    r'fetch-related-to-university',
    FetchRelatedToUniversity,
    basename='fetch-related-to-university'
)

# =========================
# URL Patterns
# =========================

urlpatterns = [

    # Router endpoints
    path('', include(router.urls)),

    # =========================
    # Location Relations
    # =========================

    path(
        'colleges/<int:college_id>/departments/',
        CollegeDepartmentsView.as_view(),
        name='college-departments'
    ),

    path(
        'colleges/<int:college_id>/programs/',
        CollegeProgramsView.as_view(),
        name='college-programs'
    ),

    # (Useful for DepartmentDetails page)
    path(
        'departments/<int:dept_id>/programs/',
        CollegeProgramsView.as_view(),
        name='department-programs'
    ),

    # =========================
    # Approval Endpoints
    # =========================

    path(
        'approvals/<int:pk>/approve/',
        ApprovalRequestViewSet.as_view({'post': 'approve'}),
        name='approval-approve'
    ),

    path(
        'approvals/<int:pk>/reject/',
        ApprovalRequestViewSet.as_view({'post': 'reject'}),
        name='approval-reject'
    ),

    # =========================
    # Import Users
    # =========================

    path(
        'system/import/users/validate/',
        import_users_validate,
        name='import-users-validate'
    ),

    path(
        'system/import/users/commit/',
        import_users_commit,
        name='import-users-commit'
    ),

    # =========================
    # Import Projects
    # =========================

    path(
        'import_projects_validate/',
        import_projects_validate,
        name='import-projects-validate'
    ),

    path(
        'import_projects_commit/',
        import_projects_commit,
        name='import-projects-commit'
    ),

    path(
        'system/import/projects/template/',
        import_projects_template,
        name='import-projects-template'
    ),

    # =========================
    # Utility APIs
    # =========================

    path('dropdown-data/', dropdown_data, name='dropdown-data'),
    path('bulk-fetch/', bulk_fetch, name='bulk-fetch'),
    path('dean-stats/', dean_stats, name='dean-stats'),
    path('csrf/', get_csrf_token, name='get-csrf'),

    path(
        'City/',
        CityViewSet.as_view({'get': 'list'}),
        name='city-list'
    ),

    # =========================
    # Template Views
    # =========================

    # project imports
# Change these lines to add the trailing slash /
    path('import_projects_validate/', import_projects_validate, name='import-projects-validate'),
    path('import_projects_commit/', import_projects_commit, name='import-projects-commit'),
    path('import-projects/template/', import_projects_template, name='import_projects_template'),
    # students import
    path('import-students/template/', import_students_template, name='import_students_template'),
    path('import-students/validate/', import_students_validate, name='import_students_validate'),
    path('import-students/commit/',   import_students_commit,   name='import_students_commit'),
    path(
        'groups/',
        login_required(TemplateView.as_view(template_name='core/groups.html')),
        name='groups'
    ),

    path(
        'invitations/',
        login_required(TemplateView.as_view(template_name='core/invitations.html')),
        name='invitations'
    ),

    path(
        'approvals/',
        login_required(TemplateView.as_view(template_name='core/approvals.html')),
        name='approvals'
    ),
]

# =========================
# Media Files
# =========================

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
