from django.shortcuts import render,redirect,get_object_or_404
from products.models import *
from django.contrib.auth import authenticate,login , logout
from django.contrib.auth.forms import AuthenticationForm , UserCreationForm
from django.urls import reverse
from accounts.models import *
from django.contrib.auth.decorators import login_required
from accounts.forms import *
from django.db.models import Sum, Q , Count
from datetime import timedelta
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone
import random
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils import timezone
from django.contrib import messages
from .utils import *
from django.conf import settings
import requests

from django.conf import settings
from django.contrib import messages




def indexone(request):

    # --------------------------------
    # جدیدترین محصولات
    # --------------------------------
    newest_products = (
        Products.objects
        .filter(status=True)
        .select_related("brand")
        .prefetch_related("images", "category")
        .order_by("-created_date")[:12]
    )

    # --------------------------------
    # محبوب‌ترین محصولات
    # بر اساس فروش واقعی
    # --------------------------------
    popular_products = (
        Products.objects
        .filter(
            status=True,
            cart_items__cart__status="paid"
        )
        .annotate(
            total_sold=Sum(
                "cart_items__quantity",
                filter=Q(
                    cart_items__cart__status="paid"
                )
            )
        )
        .filter(total_sold__gt=0)
        .select_related("brand")
        .prefetch_related("images", "category")
        .order_by(
            "-total_sold",
            "-created_date"
        )[:12]
    )

    # --------------------------------
    # محصولات تخفیف‌دار
    # --------------------------------
    special_products = (
        Products.objects
        .filter(
            status=True,
            offer=True,
            discount_percent__gt=0
        )
        .select_related("brand")
        .prefetch_related("images", "category")
        .order_by(
            "-discount_percent",
            "-created_date"
        )[:12]
    )

    # --------------------------------
    # برندها
    # فقط برندهایی که محصول فعال دارند
    # --------------------------------
    brands = (
        Brand.objects
        .filter(products__status=True)
        .annotate(
            products_count=Count(
                "products",
                filter=Q(products__status=True),
                distinct=True
            )
        )
        .filter(products_count__gt=0)
        .order_by("name")
        .distinct()
    )

    # --------------------------------
    # علاقه‌مندی‌های کاربر
    # --------------------------------
    liked_products = []

    if request.user.is_authenticated:

        account, created = Account.objects.get_or_create(
            user=request.user
        )

        likes, created = Likes.objects.get_or_create(
            contact=account
        )

        liked_products = likes.product.all()

    # --------------------------------
    # بنرهای فعال
    # --------------------------------
    banners = (
        Banner.objects
        .filter(is_active=True)
        .order_by(
            "priority",
            "-created_at"
        )
    )

    # --------------------------------
    # پیام‌های کاربر
    # --------------------------------
    messages = []

    if request.user.is_authenticated:
        messages = (
            Message.objects
            .filter(user=request.user)
            .order_by("-created_at")
        )

    return render(
        request,
        "templates/index.html",
        {
            "kala": newest_products,

            "newest_products": newest_products,

            # برای سازگاری با HTML قبلی
            "latest_products": newest_products,

            "popular_products": popular_products,

            "special_products": special_products,

            "brands": brands,

            "liked_products": liked_products,

            "banners": banners,

            "messages": messages,
        }
    )

def about_us(request):
    return render(request,'templates/about-us.html')

def login_user(request):
    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(
                request,
                username=username,
                password=password
            )

            if user is not None:
                login(request, user)
                return redirect('/login/')

    else:
        form = AuthenticationForm()

    inform = {
        'form': form,
    }

    return render(request, 'templates/login.html', inform)


def logout_user(request):
    logout(request)

    return redirect('/login/')


def signup_user(request):

    if request.user.is_authenticated:
        return redirect('accounts:indexone')

    if request.method == 'POST':

        form = UserCreationForm(request.POST)

        token = request.POST.get("cf-turnstile-response")

        try:
            response = requests.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data={
                    "secret": settings.TURNSTILE_SECRET_KEY,
                    "response": token,
                },
                timeout=5
            )

            result = response.json()

        except requests.RequestException:
            messages.error(
                request,
                "خطا در ارتباط با سرویس امنیتی. لطفاً دوباره تلاش کنید."
            )

            return render(
                request,
                "templates/signup.html",
                {
                    "form": form,
                    "turnstile_site_key": settings.TURNSTILE_SITE_KEY,
                }
            )

        if not result.get("success"):
            messages.error(
                request,
                "لطفاً تأیید کنید که ربات نیستید."
            )

        elif form.is_valid():

            user = form.save()

            Account.objects.get_or_create(
                user=user
            )

            return redirect("accounts:login")

    else:
        form = UserCreationForm()

    return render(
        request,
        "templates/signup.html",
        {
            "form": form,
            "turnstile_site_key": settings.TURNSTILE_SITE_KEY,
        }
    )
@login_required
def complete(request):

    account, created = Account.objects.get_or_create(
    user=request.user
)

    old_number = account.number

    next_url = request.GET.get(
    "next",
    reverse("accounts:indexone")
)

    is_complete = bool(
    account.number and
    account.adress and
    account.postcode and
    request.user.email
)

    if request.method == "POST":

        form = AccountForm(
        request.POST,
        instance=account
    )

        if form.is_valid():

            account = form.save(
            commit=False
        )

        # اگر شماره موبایل تغییر کرده باشد
            if old_number != account.number:

                account.is_phone_verified = False

            # حذف OTP قبلی
            PhoneOTP.objects.filter(
                account=account
            ).delete()

        account.save()

        return redirect(next_url)

    else:

        form = AccountForm(
        instance=account
    )

    template = (
    "edit.html"
        if is_complete
        else "complete.html"
)

    return render(
    request,
    template,
    {
        "form": form,
        "next": next_url,
    }
)
@login_required
def like_product(request, product_id):

    product = get_object_or_404(
        Products,
        id=product_id
    )

    account, created = Account.objects.get_or_create(
        user=request.user
    )

    likes, created = Likes.objects.get_or_create(
        contact=account
    )

    if likes.product.filter(id=product.id).exists():
        likes.product.remove(product)
    else:
        likes.product.add(product)

    return redirect(request.META.get('HTTP_REFERER', '/'))



@login_required
def toggle_like(request, product_id):

    product = get_object_or_404(
        Products,
        id=product_id
    )

    account, created = Account.objects.get_or_create(
        user=request.user
    )

    likes, created = Likes.objects.get_or_create(
        contact=account
    )

    if likes.product.filter(id=product.id).exists():
        likes.product.remove(product)
    else:
        likes.product.add(product)

    return redirect(request.META.get('HTTP_REFERER', '/'))




@login_required
def add_comment(request, pid):

    kala = get_object_or_404(
        Products,
        id=pid
    )

    if request.method == "POST":

        form = CommentForm(request.POST)

        if form.is_valid():

            comment = form.save(commit=False)
            comment.product = kala
            comment.contact = request.user.account
            comment.save()

    return redirect("/")

@login_required
def account_info(request):

    account, created = Account.objects.get_or_create(
        user=request.user
    )

    return render(
        request,
        "account.html",
        {
            "account": account,
        }
    )


@login_required
def verify_phone(request):

    account = get_object_or_404(
        Account,
        user=request.user
    )

    next_url = request.GET.get(
        "next",
        reverse("accounts:indexone")
    )

    # اگر شماره قبلاً تایید شده
    if account.is_phone_verified:
        return redirect(next_url)

    # گرفتن یا ساخت OTP
    otp, created = PhoneOTP.objects.get_or_create(
        account=account
    )

    now = timezone.now()

    # =====================================================
    # جلوگیری از ارسال مجدد سریع
    # =====================================================

    if (
        not created
        and otp.created_at
        and (now - otp.created_at).total_seconds()
        < settings.OTP_RESEND_TIME
    ):

        remaining = max(
            0,
            settings.OTP_EXPIRE_TIME
            - int(
                (
                    now - otp.created_at
                ).total_seconds()
            )
        )

        return render(
            request,
            "verify-phone.html",
            {
                "next": next_url,
                "remaining": remaining,
            }
        )

    # =====================================================
    # تولید کد جدید
    # =====================================================

    code = generate_otp()

    # =====================================================
    # ذخیره OTP
    # =====================================================

    otp.code = code
    otp.purpose = "verify_phone"
    otp.attempts = 0
    otp.created_at = now

    otp.save()

    # =====================================================
    # ارسال SMS
    # =====================================================

    response = send_otp(
        account.number,
        code
    )

    # =====================================================
    # بررسی نتیجه ارسال
    # =====================================================

    if response is None:

        messages.error(
            request,
            "ارسال کد تایید با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
        )

        return render(
            request,
            "verify-phone.html",
            {
                "next": next_url,
                "remaining": 0,
            }
        )

    # =====================================================
    # ارسال موفق
    # =====================================================

    messages.success(
        request,
        "کد تایید برای شما ارسال شد."
    )

    return render(
        request,
        "verify-phone.html",
        {
            "next": next_url,
            "remaining": settings.OTP_EXPIRE_TIME,
        }
    )

@login_required
def verify_phone_confirm(request):

    if request.method != "POST":
        return redirect(
            "accounts:verify-phone"
        )

    account = get_object_or_404(
        Account,
        user=request.user
    )

    otp = get_object_or_404(
        PhoneOTP,
        account=account
    )

    next_url = request.POST.get(
        "next",
        reverse("accounts:indexone")
    )

    code = request.POST.get(
        "code",
        ""
    ).strip()

    # =====================================================
    # بررسی انقضا
    # =====================================================

    if timezone.now() > (
        otp.created_at
        + timedelta(
            seconds=settings.OTP_EXPIRE_TIME
        )
    ):

        otp.delete()

        messages.error(
            request,
            "زمان کد تایید به پایان رسیده است."
        )

        return redirect(
            f"{reverse('accounts:verify-phone')}?next={next_url}"
        )

    # =====================================================
    # محدودیت تعداد تلاش
    # =====================================================

    if otp.attempts >= settings.OTP_MAX_ATTEMPTS:

        otp.delete()

        messages.error(
            request,
            "تعداد دفعات مجاز به پایان رسید."
        )

        return redirect(
            f"{reverse('accounts:verify-phone')}?next={next_url}"
        )

    # =====================================================
    # بررسی کد
    # =====================================================

    if otp.code != code:

        otp.attempts += 1

        otp.save(
            update_fields=[
                "attempts"
            ]
        )

        messages.error(
            request,
            "کد وارد شده صحیح نیست."
        )

        remaining = max(
            0,
            settings.OTP_EXPIRE_TIME
            - int(
                (
                    timezone.now()
                    - otp.created_at
                ).total_seconds()
            )
        )

        return render(
            request,
            "verify-phone.html",
            {
                "remaining": remaining,
                "next": next_url,
            }
        )

    # =====================================================
    # تایید موفق
    # =====================================================

    account.is_phone_verified = True

    account.save(
        update_fields=[
            "is_phone_verified"
        ]
    )

    # حذف OTP
    otp.delete()

    messages.success(
        request,
        "شماره موبایل با موفقیت تایید شد."
    )

    return redirect(next_url)


def forgot_password(request):

    if request.method == "POST":

        phone = request.POST.get(
            "number",
            ""
        ).strip()

        # =================================================
        # بررسی شماره
        # =================================================

        if not phone:

            messages.error(
                request,
                "شماره موبایل را وارد کنید."
            )

            return render(
                request,
                "forgot_password.html"
            )

        account = Account.objects.filter(
            number=phone
        ).select_related(
            "user"
        ).first()

        if not account:

            messages.error(
                request,
                "شماره موبایل در سیستم پیدا نشد."
            )

            return render(
                request,
                "forgot_password.html"
            )

        # =================================================
        # گرفتن یا ساخت OTP
        # =================================================

        otp, created = PhoneOTP.objects.get_or_create(
            account=account,
            defaults={
                "code": "",
                "purpose": "reset_password",
                "attempts": 0,
            }
        )

        now = timezone.now()

        # =================================================
        # جلوگیری از ارسال مجدد سریع
        # =================================================

        if (
            not created
            and otp.purpose == "reset_password"
            and otp.created_at
            and (now - otp.created_at).total_seconds()
            < settings.OTP_RESEND_TIME
        ):

            remaining = max(
                0,
                settings.OTP_EXPIRE_TIME
                - int(
                    (
                        now - otp.created_at
                    ).total_seconds()
                )
            )

            return render(
                request,
                "forgot_password_verify.html",
                {
                    "remaining": remaining,
                    "phone": phone,
                }
            )

        # =================================================
        # تولید OTP
        # =================================================

        code = generate_otp()

        # =================================================
        # ذخیره OTP
        # =================================================

        otp.code = code
        otp.purpose = "reset_password"
        otp.attempts = 0
        otp.created_at = now

        otp.save()

        # =================================================
        # ارسال SMS
        # =================================================

        response = send_otp(
            account.number,
            code
        )

        # =================================================
        # بررسی ارسال
        # =================================================

        if response is None:

            messages.error(
                request,
                "ارسال کد تایید با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
            )

            return render(
                request,
                "forgot_password.html"
            )

        messages.success(
            request,
            "کد تایید برای شما ارسال شد."
        )

        return render(
            request,
            "forgot_password_verify.html",
            {
                "remaining": settings.OTP_EXPIRE_TIME,
                "phone": phone,
            }
        )

    return render(
        request,
        "forgot_password.html"
    )

def forgot_password_verify(request):

    if request.method != "POST":
        return redirect(
            "accounts:forgot_password"
        )

    phone = request.POST.get(
        "phone",
        ""
    ).strip()

    code = request.POST.get(
        "code",
        ""
    ).strip()

    account = Account.objects.filter(
        number=phone
    ).first()

    if not account:
        messages.error(
            request,
            "اطلاعات وارد شده معتبر نیست."
        )
        return redirect(
            "accounts:forgot_password"
        )

    otp = PhoneOTP.objects.filter(
        account=account,
        purpose="reset_password"
    ).first()

    if not otp:
        messages.error(
            request,
            "کد تاییدی وجود ندارد."
        )
        return redirect(
            "accounts:forgot_password"
        )

    if timezone.now() > (
        otp.created_at
        + timedelta(
            seconds=settings.OTP_EXPIRE_TIME
        )
    ):

        otp.delete()

        messages.error(
            request,
            "کد تایید منقضی شده است."
        )

        return redirect(
            "accounts:forgot_password"
        )

    if otp.attempts >= settings.OTP_MAX_ATTEMPTS:

        otp.delete()

        messages.error(
            request,
            "تعداد تلاش‌های مجاز تمام شده است."
        )

        return redirect(
            "accounts:forgot_password"
        )

    if otp.code != code:

        otp.attempts += 1

        otp.save(
            update_fields=[
                "attempts"
            ]
        )

        remaining = max(
            0,
            settings.OTP_EXPIRE_TIME
            - int(
                (
                    timezone.now()
                    - otp.created_at
                ).total_seconds()
            )
        )

        messages.error(
            request,
            "کد وارد شده صحیح نیست."
        )

        return render(
            request,
            "forgot_password_verify.html",
            {
                "remaining": remaining,
                "phone": phone,
            }
        )

    request.session[
        "password_reset_account"
    ] = account.id

    otp.delete()

    return redirect(
        "accounts:reset_password"
    )
def reset_password(request):

    account_id = request.session.get(
        "password_reset_account"
    )

    if not account_id:
        messages.error(
            request,
            "ابتدا شماره موبایل خود را تایید کنید."
        )

        return redirect(
            "accounts:forgot_password"
        )

    account = get_object_or_404(
        Account,
        id=account_id
    )

    if request.method == "POST":

        password = request.POST.get(
            "password",
            ""
        )

        password_confirm = request.POST.get(
            "password_confirm",
            ""
        )

        if not password:
            messages.error(
                request,
                "رمز جدید را وارد کنید."
            )

            return render(
                request,
                "reset_password.html"
            )

        if len(password) < 8:
            messages.error(
                request,
                "رمز عبور باید حداقل ۸ کاراکتر باشد."
            )

            return render(
                request,
                "reset_password.html"
            )

        if password != password_confirm:
            messages.error(
                request,
                "رمزهای عبور یکسان نیستند."
            )

            return render(
                request,
                "reset_password.html"
            )

        account.user.set_password(password)
        account.user.save()

        # پاک کردن مجوز موقت تغییر رمز
        request.session.pop(
            "password_reset_account",
            None
        )

        messages.success(
            request,
            "رمز عبور با موفقیت تغییر کرد."
        )

        return redirect(
            "accounts:login"
        )

    return render(
        request,
        "reset_password.html"
    )
@login_required
def messages_view(request):

    messages = Message.objects.filter(
        user=request.user
    ).order_by(
        '-created_at'
    )

    unread_count = messages.filter(
        is_read=False
    ).count()

    context = {
        'messages': messages,
        'unread_count': unread_count,
    }

    return render(
        request,
        'messages.html',
        context
    )
@login_required
def message_detail(request, message_id):

    message = get_object_or_404(
        Message,
        id=message_id,
        user=request.user
    )

    if not message.is_read:
        message.is_read = True
        message.save(
            update_fields=['is_read']
        )

    return render(
        request,
        'message.html',
        {
            'message': message
        }
    )
def custom_404(request, exception):
    return render(request,"404.html",status=404
    )