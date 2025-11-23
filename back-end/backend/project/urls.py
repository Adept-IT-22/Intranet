from django.contrib import admin
from django.urls import path
from backend import views 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', views.root_view, name='root'),  # 👈 This handles http://127.0.0.1:8000/

    # Admin panel
    path('admin/', admin.site.urls),

    # Signup endpoint
    path('api/signup/', views.SignUpView.as_view(), name='signup'),

    # JWT Login endpoint
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # JWT token refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
