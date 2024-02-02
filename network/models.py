from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    pass


class Post(models.Model):
    """
    This class represents a Post in the application.

    Each Post is associated with an author (User), and has a posting time.
    """

    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    posted_at = models.DateTimeField(auto_now_add=True, editable=False)
    content = models.TextField()  # Enforce word limit using validator at the form level

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "content": self.content,
            "likes": self.likes.count(),
        }

    def __str__(self):
        return f"Posted by {self.author} on {self.posted_at.date()} {self.posted_at.time()}"


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

    follower = models.ManyToManyField('User', related_name="followers")
    following = models.ManyToManyField('User', related_name="following")
