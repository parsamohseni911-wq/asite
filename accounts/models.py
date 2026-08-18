from django.db import models
from django.contrib.auth.models import User
from products.models import Products

from django.utils import timezone


class Account(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='account'
    )
    number = models.CharField(max_length=20, blank=True)
    adress = models.CharField(max_length=60, blank=True)
    postcode = models.CharField(max_length=20, blank=True)
    is_phone_verified = models.BooleanField(default=False)

    def str(self):
        return self.user.username


class Coment(models.Model):
    contact = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name='comments'
    )

    messege = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.contact.user.username

    

class Likes(models.Model):
    contact = models.OneToOneField(
        Account,
        on_delete=models.CASCADE
    )
    product = models.ManyToManyField(Products)

    def str(self):
        return self.contact.user.username

class Message(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_messages'
    )

    title = models.CharField(
        max_length=150
    )

    text = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_read = models.BooleanField(
        default=False
    )

    def str(self):
        return f'{self.user.username} - {self.title}'
class Banner(models.Model):
    image = models.ImageField(
        upload_to='banners/'
    )

    title = models.CharField(
        max_length=150,
        blank=True
    )

    link = models.CharField(
        max_length=500,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    priority = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['priority', '-created_at']

    def str(self):
        return self.title or f'Banner {self.id}'

class PhoneOTP(models.Model):

    PURPOSE_CHOICES = [
        ("verify_phone", "Verify Phone"),
        ("reset_password", "Reset Password"),
    ]

    account = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        related_name="otp"
    )

    code = models.CharField(
        max_length=6
    )

    purpose = models.CharField(
        max_length=30,
        choices=PURPOSE_CHOICES,
        default="verify_phone"
    )

    created_at = models.DateTimeField(
        default=timezone.now
    )

    attempts = models.PositiveIntegerField(
        default=0
    )

    def str(self):
        return self.account.user.username