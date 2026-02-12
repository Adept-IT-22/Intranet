from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from backend.views import signup_view, root_view, current_user, update_profile, logout_view, active_users
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", root_view, name="root"),

    path("admin/", admin.site.urls),

    # Auth / JWT
    path("api/signup/", signup_view, name="signup"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/user/", current_user, name="current_user"),
    path("api/auth/profile/", update_profile, name="update_profile"),
    path("api/auth/logout/", logout_view, name="logout"),
    path("api/auth/active-users/", active_users, name="active_users"),
   

    # App APIs
    path("api/", include("documents.urls")),
    path("api/", include("events.urls")),
    path("api/support/", include("support.urls")),
    path('api/chat/', include('chat.urls')),
    path('api/', include('announcements.urls')),
    path('api/', include('innovations.urls')),
]

# Serve media in dev
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
