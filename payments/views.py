from django.shortcuts import render
import requests
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from accounts.models import *
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.db import transaction
from django.utils import timezone
from cart.views import *



@login_required
def start_payment(request):

    account = get_object_or_404(
        Account,
        user=request.user
    )

    # بررسی کامل بودن اطلاعات
    if not (
        account.number and
        account.adress and
        account.postcode
    ):

        return redirect(
            f"{reverse('accounts:complete')}?next={request.path}"
        )

    # بررسی تایید شماره موبایل
    if not account.is_phone_verified:

        messages.warning(
            request,
            "ابتدا شماره موبایل خود را تایید کنید."
        )

        return redirect(
            f"{reverse('accounts:verify-phone')}?next={request.path}"
        )
    # آخرین سبد در حال پردازش کاربر
    cart = (
        Cart.objects
        .filter(
            contact=account,
            status="pending"
        )
        .order_by("-created_date")
        .first()
    )

    if not cart:
        return render(
            request,
            "payment/error.html",
            {
                "message": "سبد خریدی برای پرداخت وجود ندارد."
            }
        )

    # جلوگیری از پرداخت سبد خالی
    if not cart.items.exists():
        return render(
            request,
            "payment/error.html",
            {
                "message": "سبد خرید خالی است."
            }
        )

    # محاسبه مبلغ
    total_price = cart.total_price

    if total_price <= 0:
        return render(
            request,
            "payment/error.html",
            {
                "message": "مبلغ سبد خرید معتبر نیست."
            }
        )

    # اگر قیمت‌های دیتابیس تومان هستند:
    amount_rial = total_price * 10

    callback_url = request.build_absolute_uri(
        reverse("products:payment_callback")
    )

    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": amount_rial,
        "description": f"پرداخت سفارش شماره {cart.id}",
        "callback_url": callback_url,
        "metadata": {
            "mobile": account.number,
            "order_id": str(cart.id),
        }
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        response = requests.post(
            settings.ZARINPAL_REQUEST_URL,
            json=payload,
            headers=headers,
            timeout=15
        )

        result = response.json()

    except requests.RequestException:
        return render(
            request,
            "payment/error.html",
            {
                "message": "ارتباط با درگاه پرداخت برقرار نشد."
            }
        )

    data = result.get("data", {})

    if data.get("code") != 100:
        return render(
            request,
            "payment/error.html",
            {
                "message": "ایجاد تراکنش در زرین‌پال انجام نشد.",
                "error": result.get("errors", [])
            }
        )

    authority = data.get("authority")

    if not authority:
        return render(
            request,
            "payment/error.html",
            {
                "message": "شناسه پرداخت از زرین‌پال دریافت نشد."
            }
        )

    # انتقال کاربر به زرین پال
    return redirect(
        f"{settings.ZARINPAL_STARTPAY_URL}{authority}"
    )

@login_required
def payment_callback(request):

    authority = request.GET.get("Authority")
    status = request.GET.get("Status")

    # -----------------------------
    # بررسی Authority
    # -----------------------------

    if not authority:
        return render(
            request,
            "error.html",
            {
                "message": "شناسه تراکنش دریافت نشد."
            }
        )

    # -----------------------------
    # پرداخت توسط کاربر لغو شده
    # -----------------------------

    if status != "OK":
        return render(
            request,
            "error.html",
            {
                "message": "پرداخت توسط کاربر لغو شد یا ناموفق بود."
            }
        )

    # -----------------------------
    # پیدا کردن Account
    # -----------------------------

    account = get_object_or_404(
        Account,
        user=request.user
    )

    # -----------------------------
    # پیدا کردن Cart
    # -----------------------------

    cart = (
        Cart.objects
        .filter(
            contact=account,
            authority=authority
        )
        .first()
    )

    if not cart:
        return render(
            request,
            "error.html",
            {
                "message": "سبد خرید مربوط به این تراکنش پیدا نشد."
            }
        )

    # -----------------------------
    # اگر قبلاً پرداخت شده
    # -----------------------------

    if cart.status == "paid":

        return render(
            request,
            "success.html",
            {
                "cart": cart,
                "ref_id": cart.ref_id,
                "already_verified": True,
            }
        )

    # -----------------------------
    # محاسبه مبلغ
    # -----------------------------

    total_price = cart.total_price

    if total_price <= 0:
        return render(
            request,
            "error.html",
            {
                "message": "مبلغ سفارش معتبر نیست."
            }
        )

    # قیمت دیتابیس = تومان
    # زرین پال = ریال

    amount_rial = total_price * 10

    # -----------------------------
    # درخواست Verify
    # -----------------------------

    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": amount_rial,
        "authority": authority,
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:

        response = requests.post(
            settings.ZARINPAL_VERIFY_URL,
            json=payload,
            headers=headers,
            timeout=15
        )

        result = response.json()

    except requests.RequestException:

        return render(
            request,
            "payment/error.html",
            {
                "message": "ارتباط با زرین‌پال برای بررسی پرداخت برقرار نشد."
            }
        )

    data = result.get("data", {})
    code = data.get("code")

    # -----------------------------
    # پرداخت موفق
    # -----------------------------

    if code == 100:

        ref_id = data.get("ref_id")

        with transaction.atomic():

            # قفل کردن سفارش
            cart = (
                Cart.objects
                .select_for_update()
                .prefetch_related("items__product")
                .get(pk=cart.pk)
            )

            # اگر همزمان قبلاً پرداخت شده
            if cart.status == "paid":

                return render(
                    request,
                    "payment/success.html",
                    {
                        "cart": cart,
                        "ref_id": cart.ref_id,
                        "already_verified": True,
                    }
                )

            # -----------------------------
            # بررسی موجودی
            # -----------------------------

            for item in cart.items.all():

                product = item.product

                if product.inventory < item.quantity:

                    cart.status = "canceled"


                cart.save(
                        update_fields=[
                            "status",
                            "updated_date",
                        ]
                    )

                return render(
                        request,
                        "payment/error.html",
                        {
                            "message": (
                                f"موجودی محصول «{product.name}» "
                                "برای تکمیل سفارش کافی نیست."
                            )
                        }
                    )

            # -----------------------------
            # کم کردن موجودی
            # -----------------------------

            for item in cart.items.all():

                product = item.product

                product.inventory -= item.quantity

                product.save(
                    update_fields=[
                        "inventory",
                        "updated_date",
                    ]
                )

            # -----------------------------
            # ثبت نهایی سفارش
            # -----------------------------

            cart.status = "paid"
            cart.ref_id = str(ref_id) if ref_id else None
            cart.paid_at = timezone.now()

            cart.save(
                update_fields=[
                    "status",
                    "ref_id",
                    "paid_at",
                    "updated_date",
                ]
            )

        # -----------------------------
        # نمایش موفقیت
        # -----------------------------

        return render(
            request,
            "payment/success.html",
            {
                "cart": cart,
                "ref_id": ref_id,
                "already_verified": False,
            }
        )

    # -----------------------------
    # قبلاً Verify شده
    # -----------------------------

    if code == 101:

        return render(
            request,
            "payment/success.html",
            {
                "cart": cart,
                "ref_id": cart.ref_id or data.get("ref_id"),
                "already_verified": True,
            }
        )

    # -----------------------------
    # Verify ناموفق
    # -----------------------------

    return render(
        request,
        "payment/error.html",
        {
            "message": "پرداخت تأیید نشد.",
            "error": result.get("errors", []),
        }
    )
