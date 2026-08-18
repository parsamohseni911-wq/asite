from django.shortcuts import render
from django.shortcuts import render, get_object_or_404
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
from cart.models import *


@login_required
def cart(request):

    account = get_object_or_404(
        Account,
        user=request.user
    )

    cart, created = Cart.objects.get_or_create(
        contact=account,
        status="pending"
    )

    items = cart.items.select_related("product")

    context = {
        "cart": cart,
        "cart_items": items,
        "cart_total": cart.total_price,
    }

    return render(request,"cart.html",context)