from django.contrib import admin
from django.contrib import admin
from accounts.models import Account, Coment, Likes, Message
from django.contrib import admin
from .models import Banner
from django.contrib import admin
from .models import Message
from django.contrib import admin
from .models import *



@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):

    list_display = (
        'user',

    )




@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'title',
        'is_read',
        'created_at',
    )

    list_filter = (
        'is_read',
        'created_at',
    )

    search_fields = (
        'user__username',
        'user__email',
        'title',
        'text',
    )

    list_editable = (
        'is_read',
    )

    ordering = (
        '-created_at',
    )





@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):

    list_display = (
        'title',
        'is_active',
        'priority',
        'created_at',
    )

    list_filter = (
        'is_active',
    )

    search_fields = (
        'title',
    )

    list_editable = (
        'is_active',
        'priority',
    )

