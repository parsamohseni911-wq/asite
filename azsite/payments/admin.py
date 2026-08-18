from django.contrib import admin

from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages

from cart.models import Cart


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "contact",
        "status_display",
        "total_price_display",
        "paid_at",
        "shipping_status",
    )

    list_filter = (
        "status",
        "is_shipped",
        "paid_at",
    )

    search_fields = (
        "id",
        "contact__user__username",
        "contact__number",
    )

    readonly_fields = (
        "created_date",
        "updated_date",
        "paid_at",
        "authority",
        "ref_id",
    )

    actions = (
        "mark_as_shipped",
        "mark_as_not_shipped",
    )

    # -----------------------------------------
    # وضعیت پرداخت
    # -----------------------------------------

    @admin.display(
        description="وضعیت پرداخت",
        ordering="status"
    )
    def status_display(self, obj):

        if obj.status == "paid":
            return format_html(
                '<span style="'
                'color:#16a34a;'
                'font-weight:bold;'
                '">'
                'پرداخت شده'
                '</span>'
            )

        if obj.status == "pending":
            return format_html(
                '<span style="'
                'color:#d97706;'
                'font-weight:bold;'
                '">'
                'در حال پردازش'
                '</span>'
            )

        if obj.status == "canceled":
            return format_html(
                '<span style="'
                'color:#dc2626;'
                'font-weight:bold;'
                '">'
                'لغو شده'
                '</span>'
            )

        return obj.get_status_display()

    # -----------------------------------------
    # مبلغ
    # -----------------------------------------

    @admin.display(
        description="مبلغ سفارش"
    )
    def total_price_display(self, obj):

        return f"{obj.total_price:,} تومان"

    # -----------------------------------------
    # وضعیت ارسال
    # -----------------------------------------

    @admin.display(
        description="وضعیت ارسال",
        boolean=False
    )
    def shipping_status(self, obj):

        if obj.status != "paid":
            return format_html(
                '<span style="color:#6b7280;">'
                'قابل ارسال نیست'
                '</span>'
            )

        if obj.is_shipped:
            return format_html(
                '<span style="'
                'color:#16a34a;'
                'font-weight:bold;'
                '">'
                '✓ ارسال شده'
                '</span>'
            )

        return format_html(
            '<span style="'
            'color:#dc2626;'
            'font-weight:bold;'
            '">'
            '✗ ارسال نشده'
            '</span>'
        )

    # -----------------------------------------
    # Action: ارسال شد
    # -----------------------------------------

    @admin.action(
        description="علامت‌گذاری سفارش‌های انتخاب‌شده به عنوان ارسال‌شده"
    )
    def mark_as_shipped(self, request, queryset):

        queryset = queryset.filter(
            status="paid",
            is_shipped=False
        )

        count = queryset.update(
            is_shipped=True
        )

        self.message_user(
            request,
            f"{count} سفارش با موفقیت به عنوان ارسال‌شده ثبت شد.",
            messages.SUCCESS
        )

    # -----------------------------------------
    # Action: برگشت به ارسال نشده
    # -----------------------------------------

    @admin.action(
        description="علامت‌گذاری به عنوان ارسال نشده"
    )
    def mark_as_not_shipped(self, request, queryset):

        queryset = queryset.filter(
            status="paid",
            is_shipped=True
        )

        count = queryset.update(
            is_shipped=False
        )

        self.message_user(
            request,
            f"{count} سفارش به حالت ارسال نشده برگشت.",
            messages.SUCCESS
        )
