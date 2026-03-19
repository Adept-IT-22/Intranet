from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from backend.views import signup_view, root_view, current_user, user_list, update_user_role, delete_user, employee_list, upload_employees_csv, upload_avatar, remove_avatar
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

    # App Modules (Simplified includes to match frontend paths)
    path("api/chat/", include("chat.urls")),
    path("api/", include("announcements.urls")),
    path("api/", include("documents.urls")),
    path("api/", include("events.urls")),
    path("api/support/", include("support.urls")),

    # Admin / Management
    path("api/admin/users/", user_list, name="user_list"),
    path("api/admin/users/<int:user_id>/role/", update_user_role, name="update_user_role"),
    path("api/admin/users/<int:user_id>/delete/", delete_user, name="delete_user"),
    path("api/employees/", employee_list, name="employee_list"),
    path("api/admin/upload-employees/", upload_employees_csv, name="upload_employees_csv"),
    path("api/profile/upload-avatar/", upload_avatar, name="upload_avatar"),
    path("api/admin/users/<int:user_id>/remove-avatar/", remove_avatar, name="remove_avatar"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
