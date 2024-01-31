from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    """
    This class represents a Post in the application.

    Each Post is associated with an author (User), and has a posting time.
    """

    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    posted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()  # Enforce word limit using validator at the form level


class Like(models.Model):
    """
    This class represents a Like in the application.

    Each like is associated with a User and a Post.
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="likes")


class Follow(models.Model):
    """
    This class represents Follows in the application.

    Each User can have other users that follow them, and users that they follow.
    """

    follower = models.ManyToManyField('User')
    following = models.ManyToManyField('User')
