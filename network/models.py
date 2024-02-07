from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    This class represents a User in the application

    Each User inherits from the AbstractUser class,
    as well as has other users as followers, and users that they follow.
    """
    follower = models.ManyToManyField("self", symmetrical=False, related_name="followers")
    following = models.ManyToManyField("self", symmetrical=False, related_name="followings")


class Post(models.Model):
    """
    This class represents a Post in the application.

    Each Post is associated with an author (User), has a posting time,
    post content, and a list of users who have liked it.
    """

    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    posted_at = models.DateTimeField(auto_now_add=True, editable=False)
    modified = models.BooleanField(default=False)
    modified_at = models.DateTimeField(auto_now=True)
    content = models.TextField()  # Enforce word limit using validator at the form level
    likes = models.ManyToManyField('User', related_name="liked")

    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "content": self.content,
            "likes": self.likes.count(),
        }

    def __str__(self):
        return f"Posted by {self.author} on {self.posted_at.date()} {self.posted_at.time()}"
