from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from core.auth_views import CustomLoginView
from django.views.generic import RedirectView
from django.conf.urls.static import static

urlpatterns = [
    path("", RedirectView.as_view(url="/admin/", permanent=False)),
    # Admin panel (moved to /admin/ to avoid URL conflicts with API)
    path('admin/', admin.site.urls),

    # Custom login - first, CSRF exempt
    path('api/auth/login/', CustomLoginView.as_view(), name='rest_login'),

    # dj_rest_auth endpoints (logout, user details, password reset, etc.)
    path('api/auth/logout/', include('dj_rest_auth.urls')),  # ⚠ Exclude login to prevent conflict

    # Core app API endpoints
    path('api/', include('core.urls')),

    # Optional DRF browsable API login
    # path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
