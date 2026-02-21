# core/auth_views.py
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from dj_rest_auth.views import LoginView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .serializers import UserSerializer


@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(LoginView):
    # Ensure the view allows anonymous access and does not depend on SessionAuthentication
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        # Use parent implementation to validate and create tokens
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            # `self.user` is set by the parent LoginView during login()
            try:
                user_data = UserSerializer(self.user).data
            except Exception:
                user_data = None

            custom_data = {
                "access": response.data.get('access'),
                "refresh": response.data.get('refresh'),
                "user": user_data,
            }
            return Response(custom_data, status=status.HTTP_200_OK)

        return response
