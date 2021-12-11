from django.contrib import admin
from .models import Post, User


class PostDisplay(admin.ModelAdmin):
    list_display = ("post", "id")


# Register your models here.
admin.site.register(Post, PostDisplay)
admin.site.register(User)
