from django.contrib import admin
from django.urls import path , include
from accounts.views import *
from cart.views import *
from payments.views import *
from products.views import *
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.sitemaps.views import sitemap 



app_name = 'cart'



urlpatterns = [

path(
    "",
    cart,
    name="cart"
),
]