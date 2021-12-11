from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import DateTimeField
from django.db.models.fields.related import ForeignKey
from django.core.exceptions import ValidationError


class User(AbstractUser):
    following = models.ManyToManyField(
        "self", symmetrical=False, related_name="followers", blank=True
    )
    liked_posts = models.ManyToManyField(
        "Post", related_name="post_likes", blank=True, default=0
    )

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "followers": self.followers.count(),
            "following": self.following.count(),
        }


class Post(models.Model):
    post = models.TextField(null=False, blank=False)
    author = ForeignKey(User, on_delete=CASCADE, related_name="posts")
    timestamp = DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.post} by {self.author.username}"

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "author": self.author.serialize(),
            "timestamp": self.timestamp.isoformat(),
            "likes": self.post_likes.count()
        }
