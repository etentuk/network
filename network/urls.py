
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("create_post", views.create_post, name="create_post"),
    path("posts/<int:page>", views.posts, name="posts"),
    path("posts/following/<int:page>",
         views.posts_following, name="posts_following"),
    path("<str:username>/<int:page>", views.profile_page, name="profile"),
    path("follow/<str:username>", views.follow, name="follow"),
]
