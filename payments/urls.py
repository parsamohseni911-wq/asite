from django.contrib import admin
from django.urls import path , include
from accounts.views import *
from cart.views import *
from payments.views import *
from products.views import *
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.sitemaps.views import sitemap 
from django.urls import path
from payments.views import (
    start_payment,
    payment_callback,
)




app_name = "payments"





urlpatterns = [

    path(
        "payment/start/",
        start_payment,
        name="start_payment"
    ),

    path(
        "payment/callback/",
        payment_callback,
        name="payment_callback"
    ),
]


