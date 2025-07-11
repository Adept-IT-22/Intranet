from django.contrib import admin
from django.urls import path
from backend import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', views.root_view, name='root'),  # ← handles http://127.0.0.1:8000/
    path('admin/', admin.site.urls),
    path('api/signup/', views.SignUpView.as_view(), name='signup'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
