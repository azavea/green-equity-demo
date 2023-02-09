from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


class AdminSite(admin.AdminSite):
    site_header = "Project Name administration"
    site_title = "Project Name site admin"
    logout_template = "admin/logged_out.html"


class EmailAsUsernameUserAdmin(UserAdmin):
    list_display = ("email", "is_staff")
    search_fields = ("email",)
    ordering = ("email",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                ),
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Important dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                ),
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                ),
            },
        ),
    )


admin_site = AdminSite(name="admin")
admin_site.register(User, EmailAsUsernameUserAdmin)
