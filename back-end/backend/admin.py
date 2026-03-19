from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Specify fields from CustomUser model to be displayed in the admin panel
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'department', 'team')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'department', 'team')}),
    )
    list_display = ("username", "email", "role", "department", "is_staff", "is_superuser")
    list_filter = ("role", "department", "is_staff", "is_superuser")
    search_fields = ("username", "email")
