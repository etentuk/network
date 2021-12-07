from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import DateTimeField
from django.db.models.fields.related import ForeignKey


class User(AbstractUser):
    following = models.ManyToManyField(
        "self", symmetrical=False, related_name="followers", blank=True
    )

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
        }

    def is_follower_valid(self):
        return bool(self.following.filter(pk=self.id))


class Post(models.Model):
    post = models.TextField()
    author = ForeignKey(User, on_delete=CASCADE, related_name="posts")
    timestamp = DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.post} by {self.author.username}"

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "author": self.author.serialize(),
            "timestamp": self.timestamp.isoformat(),
            "likes": self.likes
        }
