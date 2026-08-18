from django.contrib import admin
from django.urls import path , include
from accounts.views import *
from cart.views import *
from payments.views import *
from products.views import *
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.sitemaps.views import sitemap 



app_name = 'products'



urlpatterns = [
path('<int:pid>/',single_product,name='single_product'),
path('cart/add/<int:product_id>/',add_to_cart,name='add_to_cart'),
path('cart/decrease/<int:product_id>/',decrease_cart, name='decrease'),
path('wishlist',wish,name='wishlist'),
path('remove_from_cart/<int:product_id>/',remove_from_cart, name='remove_from_cart'),
path("search/",search_products,name="search"),
path("brand/<int:brand_id>/",brand_products,name="brand_products"),
path("best_sells/",best_selling_products,name="best_sells"),
]