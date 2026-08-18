from products.models import Products
from django.shortcuts import render,redirect
from products.models import *
from django.contrib.auth import authenticate,login , logout
from django.contrib.auth.forms import AuthenticationForm , UserCreationForm
from django.urls import reverse
from accounts.models import *
from django.contrib.auth.decorators import login_required
from accounts.forms import *
from django.shortcuts import render, get_object_or_404
from django.db import models


class Cart(models.Model):

    STATUS_CHOICES = [
        ("pending", "در حال پردازش"),
        ("paid", "پرداخت شده"),
        ("canceled", "لغو شده"),
    ]

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    contact = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="carts"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    # وضعیت ارسال
    is_shipped = models.BooleanField(
        default=False,
        verbose_name="ارسال شده"
    )

    authority = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    ref_id = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Cart {self.id}"

    @property
    def total_price(self):
        return sum(
            item.unit_price * item.quantity
            for item in self.items.all()
        )
class Cartitem(models.Model):

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )

    quantity = models.PositiveIntegerField(default=1)

    unit_price = models.PositiveBigIntegerField(default=0)

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"