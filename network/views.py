import json
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse

from .models import User, Post, Like, Follow


def index(request):
    return render(request, "network/index.html")


def post(request):

    # Retrieve new post from HTML form and add to database
    if request.method == "POST":
        content = request.POST["content"]
        new_post = Post(author=request.user, content=content)
        new_post.save()

    return redirect('index')


def posts_view(request):

    # Retrieve posts from the database, and paginate them 10 per page, ordering them by most recent

    # View for posts from Following
    if request.path == reverse('following_view'):
        following = list((request.user).following.all())
        posts = Post.objects.filter(author__in=following)

    # All Posts view
    else:
        posts = Post.objects.all()

    posts = posts.order_by('-posted_at')
    paginator = Paginator(posts, 2)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {"posts": posts, 'page_obj': page_obj}

    return render(request, "network/posts.html", context)


def profile_view(request, username):
    user = User.objects.get(username=username)
    context = {"user": user, "posts": user.posts.all()}
    return render(request, "network/profile.html", context)


def get_post(request, post_id):
    post = Post.objects.get(pk=post_id)

    if request.method == "GET":
        return JsonResponse(post.serialize())

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("content") is not None:
            post.content = data["content"]
            print(post.content)
        post.save()

        return redirect('index')


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
