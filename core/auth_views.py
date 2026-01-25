from dj_rest_auth.views import LoginView
from rest_framework.response import Response
from rest_framework import status
from .models import UserRoles
import logging
# أضف هذا السطر في الأعلى
from .serializers import UserSerializer

logger = logging.getLogger(__name__)

class CustomLoginView(LoginView):
    def post(self, request, *args, **kwargs):
        self.request = request
        self.serializer = self.get_serializer(data=request.data)
        self.serializer.is_valid(raise_exception=True)
        self.login()
        
        # الحصول على التوكنات الأصلية من dj_rest_auth
        response = self.get_response()
        
        if response.status_code == 200:
            user = self.user
            # استخدام السيريالايزر الجديد الذي أنشأناه بالأعلى
            user_data = UserSerializer(user).data
            
            # بناء الرد الموحد
            custom_data = {
                "access": response.data.get('access'),
                "refresh": response.data.get('refresh'),
                "user": user_data
            }
            return Response(custom_data, status=status.HTTP_200_OK)
        
        return response