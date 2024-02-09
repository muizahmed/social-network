from django import template

import datetime, timeago

register = template.Library()

@register.filter(name="format_date")
def format_as_timeago(datetimeobj):
    """Formats datetime object as a time difference (e.g., '2 hours ago', etc.)."""
    return timeago.format(datetimeobj, datetime.datetime.now())


def is_liked_by_user(post, user):

