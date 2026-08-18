from django.contrib import admin
from django.urls import path , include
from accounts.views import *
from cart.views import *
from payments.views import *
from products.views import *
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap 


app_name = 'accounts'

urlpatterns = [
path('',indexone,name='indexone'),
path('about_us',about_us,name='about_us'),
path('login/', login_user, name='login'),
path('logout_user/', logout_user, name='logout_user'),
path('signup_user/', signup_user, name='signup_user'),
path('complete/', complete, name='complete'),
path('like/<int:product_id>/',like_product,name='like_product'),
path('toggle-like/<int:product_id>/',toggle_like,name='toggle_like'),
path("product/<int:pid>/comment/",add_comment,name="add_comment"),path("account/",account_info,name="account_info"),
path("verify-phone/",verify_phone,name="verify-phone"),
path("verify-phone/confirm/",verify_phone_confirm,name="verify-phone-confirm"),

path("forgot-password/",forgot_password,name="forgot_password",),
path("forgot-password/verify/",forgot_password_verify,name="forgot_password_verify",),
path("forgot-password/reset/",reset_password,name="reset_password",),
path('messages/',messages_view,name='messages'),
path('messages/<int:message_id>/',message_detail,name='message_detail'),

]