from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import DateTimeField
from django.db.models.fields.related import ForeignKey


class User(AbstractUser):
    pass


class Post(models.Model):
    post = models.TextField()
    author = ForeignKey(User, on_delete=CASCADE, related_name="posts")
    timestamp = DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "author": self.author.username,
            "timestamp": self.timestamp,
        }
