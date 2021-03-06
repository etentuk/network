from django.test import Client, TestCase, RequestFactory

from .models import User, Post

# Create your tests here.


class UserTestCase(TestCase):
    def setUp(self):

        self.factory = RequestFactory()

        # Create Users.
        self.user_1 = User.objects.create_user(
            "person_1", email="person_1@test.com", password="test", pk=1)

        self.user_2 = User.objects.create_user(
            "person_2", email="person_2@test.com", password="test")

        self.post_1 = Post.objects.create(
            post="A test post", author=self.user_1
        )

        self.post_2 = Post.objects.create(
            post="A Second test post", author=self.user_2
        )

    def test_index(self):
        c = Client()
        response = c.get("/")
        self.assertEqual(response.status_code, 200)

    def test_all_posts(self):
        c = Client()
        response = c.get("/posts/1")
        res = response.json()
        self.assertEqual(len(res), 2)
