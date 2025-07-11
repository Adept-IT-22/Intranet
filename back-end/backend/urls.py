from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from backend import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/signup/', views.SignUpView.as_view(), name='signup'),  # Your signup logic
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh
]
 