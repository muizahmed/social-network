from django import template

import datetime
import timeago

register = template.Library()


@register.filter(name="format_date")
def format_as_timeago(datetimeobj):
    """Formats datetime object as a time difference (e.g., '2 hours ago', etc.)."""
    return timeago.format(datetimeobj, datetime.datetime.now())


@register.filter(name="is_following")
def is_followed_by_user(user, target):
    if target in user.following.all():
        return True
    else:
        return False


@register.filter(name="is_liked")
def is_liked_by_user(post, user):
    if post in user.liked.all():
        return True
    else:
        return False
