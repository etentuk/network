import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator

from .models import Post, User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
def create_post(request):
    # Creating a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    post = data.get("post", "")
    if(post.strip() == ""):
        return JsonResponse({"error": "Cannot create empty post"}, status=400)
    new_post = Post(post=post, author=request.user)
    new_post.save()
    return JsonResponse(new_post.serialize())


def posts(request, page):
    all_posts = Post.objects.all()
    all_posts = all_posts.order_by('-timestamp').all()
    all_posts = Paginator(all_posts, 10)
    current_page = all_posts.page(page)

    return JsonResponse({
        "page_count": all_posts.num_pages,
        "posts": [p.serialize() for p in current_page]}, safe=False)


def profile_page(request, username, page):
    try:
        user = User.objects.get(username=username)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "User does not exist"})

    if request.method == "GET":
        all_posts = user.posts.all()
        try:
            following = bool(user.followers.get(
                username=request.user.username))
        except ObjectDoesNotExist:
            following = False
        all_posts = all_posts.order_by('-timestamp').all()
        all_posts = Paginator(all_posts, 10)
        current_page = all_posts.page(page)
        return JsonResponse({"page_count": all_posts.num_pages,
                             "posts": [p.serialize() for p in current_page],
                             "user": user.serialize(),
                             "following": following
                             })


def follow(request, username):
    try:
        user = User.objects.get(username=username)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "User does not exist"})
    if request.method == "PUT" and request.user.is_authenticated:
        data = json.loads(request.body)
        is_following = data.get("following", "")
        if is_following:
            request.user.following.remove(user)
            return JsonResponse({"message": f"Successfully unfollowed {user.username.capitalize()}"}, status=200)
        else:
            if(user == request.user):
                return JsonResponse({"error": "User cannot follow Self"}, status=403)
            request.user.following.add(user)
            return JsonResponse({"message": f"Successfully followed {user.username.capitalize()}"}, status=200)
    return JsonResponse({"error": "Bad Request"}, status=400)


@login_required
def posts_following(request, page):
    users_following = request.user.following.all()
    all_posts = []
    for user in users_following:
        all_posts += [p for p in user.posts.all()]
    all_posts = Paginator(all_posts, 10)
    current_page = all_posts.page(page)
    return JsonResponse({
        "page_count": all_posts.num_pages,
        "posts": [p.serialize() for p in current_page]}, safe=False)
    
