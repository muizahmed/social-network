from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("post", views.post, name="post"),
    path("posts", views.posts_view, name="posts_view"),
    path("following", views.posts_view, name="following_view"),
    path("profile/<str:username>", views.profile_view, name="profile_view"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # Fetch Routes
    path("posts/<int:post_id>", views.get_post, name="get_post"),
    path("posts/like/<int:post_id>", views.like, name="like"),
]
