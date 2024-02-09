import json
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def post(request):

    # Retrieve new post from HTML form and add to database
    if request.method == "POST":
        content = request.POST["content"]
        new_post = Post(author=request.user, content=content)
        new_post.save()

    return redirect('posts_view')


def paginate_posts(request, posts):
    ordered_posts = posts.order_by('-modified_at', '-posted_at')
    paginator = Paginator(ordered_posts, 3)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return page_obj


def posts_view(request):

    # Retrieve posts from the database, and paginate them 10 per page, ordering them by most recent

    # View for posts from Following
    if request.path == reverse('following_view'):
        following = list(request.user.following.all())
        posts = Post.objects.filter(author__in=following)

    # All Posts view
    else:
        posts = Post.objects.all()

    page_obj = paginate_posts(request, posts)
    context = {"posts": page_obj}

    return render(request, "network/posts.html", context)


def profile_view(request, username):
    user = User.objects.get(username=username)
    posts = user.posts.all()
    page_obj = paginate_posts(request, posts)
    context = {"user": user, "posts": page_obj}
    return render(request, "network/profile.html", context)


@csrf_exempt
def get_post(request, post_id):
    post = Post.objects.get(pk=post_id)

    if request.method == "GET":
        return JsonResponse(post.serialize())

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("content") is not None:
            post.content = data["content"]
            post.modified = True
        post.save()

        return redirect('index')


@csrf_exempt
def like(request, post_id):
    post = Post.objects.get(pk=post_id)
    liked = request.user.liked.all()
    if request.method == "GET":
        user_liked = False
        if post in liked:
            user_liked = True
        likes = {"like_count": post.likes.count(), "user_liked": user_liked}
        return JsonResponse(likes)

    elif request.method == "PUT":
        if post in liked:
            request.user.liked.remove(post)
        else:
            request.user.liked.add(post)
        post.save()
        request.user.save()

    return JsonResponse({"message": "Success"})


@csrf_exempt
def follow(request, user_id):
    target = User.objects.get(pk=user_id)
    user = request.user
    if request.method == "PUT":
        if target.follower.contains(user):
            target.follower.remove(user)
            user.following.remove(target)
        else:
            target.follower.add(user)
            user.following.add(target)
        target.save()
        user.save()

    return JsonResponse({"message": "Success"})


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
