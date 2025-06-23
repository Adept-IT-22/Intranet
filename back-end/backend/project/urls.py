from django.contrib import admin
from django.urls import path
from backend import views  # adjust if your views are in a sub-app
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Signup endpoint
    path('api/signup/', views.SignUpView.as_view(), name='signup'),

    # JWT Login endpoint
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # JWT token refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
