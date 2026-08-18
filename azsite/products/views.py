from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from accounts.forms import *
from products.models import *
from accounts.models import *
from cart.models import *
from django.db.models import Q , Sum

from django.db.models import Count



def best_sells(request):
    return render(request,'templates/best_sells.html')

def single_product(request, pid):

    # =========================================================
    # محصول اصلی
    # =========================================================

    kala = get_object_or_404(
        Products,
        id=pid,
        status=True
    )


    # =========================================================
    # محصولات دیگر همین برند
    # =========================================================

    if kala.brand:

        brand_products = (
            Products.objects
            .filter(
                status=True,
                brand=kala.brand
            )
            .exclude(
                id=kala.id
            )
            .select_related(
                "brand"
            )
            .prefetch_related(
                "category",
                "images"
            )
            .order_by(
                "-created_date"
            )[:12]
        )

    else:

        # اگر محصول برند نداشته باشد،
        # هیچ محصولی به عنوان محصول هم‌برند نمایش داده نمی‌شود.

        brand_products = Products.objects.none()


    # =========================================================
    # دسته‌بندی‌های محصول اصلی
    # =========================================================

    kala_categories = kala.category.all()


    # =========================================================
    # محصولات مرتبط بر اساس Category مشترک
    # =========================================================

    if kala_categories.exists():

        related_products = (
            Products.objects
            .filter(
                status=True,
                category__in=kala_categories
            )
            .exclude(
                id=kala.id
            )
            .annotate(
                common_categories=Count(
                    "category",
                    filter=models.Q(
                        category__in=kala_categories
                    ),
                    distinct=True
                )
            )
            .filter(
                common_categories__gt=0
            )
            .select_related(
                "brand"
            )
            .prefetch_related(
                "category",
                "images"
            )
            .order_by(
                "-common_categories",
                "-created_date"
            )
            .distinct()[:12]
        )

    else:

        # اگر محصول هیچ Category نداشته باشد،
        # محصول مرتبطی نمایش داده نمی‌شود.

        related_products = Products.objects.none()


    # =========================================================
    # اطلاعات کاربر
    # =========================================================

    liked_products = []
    cart_quantity = 0


    if request.user.is_authenticated:

        # -----------------------------------------------------
        # Account
        # -----------------------------------------------------

        account, _ = Account.objects.get_or_create(
            user=request.user
        )


        # -----------------------------------------------------
        # Likes
        # -----------------------------------------------------

        likes, _ = Likes.objects.get_or_create(
            contact=account
        )

        liked_products = likes.product.all()


        # -----------------------------------------------------
        # Cart
        # -----------------------------------------------------

        cart, _ = Cart.objects.get_or_create(
            contact=account,
            status="pending"
        )


        # -----------------------------------------------------
        # تعداد محصول فعلی در سبد
        # -----------------------------------------------------

        item = (
            cart.items
            .filter(
                product=kala
            )
            .first()
        )

        if item:
            cart_quantity = item.quantity


    # =========================================================
    # دیدگاه‌های محصول
    # =========================================================

    comments = (
        Coment.objects
        .filter(
            product=kala
        )
        .select_related(
            "contact__user"
        )
        .order_by(
            "-created_at"
        )
    )


    # =========================================================
    # اطلاعات ارسال به Template
    # =========================================================

    inform = {

        # محصول اصلی
        "kala": kala,

        # علاقه‌مندی‌ها
        "liked_products": liked_products,

        # تعداد محصول فعلی در سبد
        "cart_quantity": cart_quantity,

        # دیدگاه‌ها
        "comments": comments,

        # فرم دیدگاه
        "form": CommentForm(),

        # محصولات دیگر همین برند
        "brand_products": brand_products,

        # محصولات مرتبط بر اساس Category
        "related_products": related_products,
    }


    # =========================================================
    # Render
    # =========================================================

    return render(
        request,
        "single-product.html",
        inform
    )
@login_required
def add_to_cart(request, product_id):

    product = get_object_or_404(
        Products,
        id=product_id
    )

    account = get_object_or_404(
        Account,
        user=request.user
    )

    cart, created = Cart.objects.get_or_create(

        contact=account,
        status="pending"

    )

    item, created = Cartitem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={
            "quantity": 1,
            "unit_price": product.price,
        }
    )

    if not created:
     if item.quantity < product.inventory:
      item.quantity += 1
      item.save()
    return redirect(
        "products:single_product",
        pid=product.id
    )
@login_required
def decrease_cart(request, product_id):

    product = get_object_or_404(
        Products,
        id=product_id
    )

    account = get_object_or_404(
        Account,
        user=request.user
    )

    cart = get_object_or_404(
        Cart,
        contact=account,
        status="pending"
    )

    item = get_object_or_404(
        Cartitem,
        cart=cart,
        product=product
    )



    if item.quantity > 1:
        item.quantity -= 1
        item.save()

    else:
        print("Deleting item")
        item.delete()

    return redirect(
    "products:single_product",
    pid=product.id
)
@login_required
def wish(request):
    account = Account.objects.get(user=request.user)

    likes = Likes.objects.get(contact=account)
    items = likes.product.all()

    cart = request.session.get('cart', {})

    wishlist_items = []

    for product in items:
        product_id = str(product.id)

        wishlist_items.append({
            'product': product,
            'in_cart': product_id in cart,
            'quantity': cart.get(product_id, 0),
        })

    return render(
        request,
        'user-wishlist.html',
        {
            'wishlist_items': wishlist_items,
        }
    )
@login_required
def remove_from_cart(request, product_id):

    account = get_object_or_404(Account, user=request.user)

    cart = get_object_or_404(
        Cart,
        contact=account,
        status="pending"
    )

    item = get_object_or_404(
        Cartitem,
        cart=cart,
        product_id=product_id
    )

    item.delete()

    return redirect("products:cart")



def search_products(request):

    query = request.GET.get("q", "").strip()

    products = Products.objects.none()

    if query:
        products = (
            Products.objects
            .filter(
                Q(name__icontains=query) |
                Q(brand__name__icontains=query) |
                Q(category__name__icontains=query)
            )
            .select_related("brand")
            .prefetch_related("category")
            .distinct()
        )

    context = {
        "products": products,
        "query": query,
    }

    return render(
        request,
        "search.html",
        context
    )

def brand_products(request, brand_id):

    brand = get_object_or_404(
        Brand,
        id=brand_id
    )

    products = (
        Products.objects
        .filter(
            brand=brand,
            status=True
        )
        .select_related("brand")
        .prefetch_related("category")
        .order_by("-created_date")
    )

    liked_products = []

    if request.user.is_authenticated:

        account, created = Account.objects.get_or_create(
            user=request.user
        )

        likes, created = Likes.objects.get_or_create(
            contact=account
        )

        liked_products = likes.product.all()

    return render(
        request,
        "brand-products.html",
        {
            "brand": brand,
            "products": products,
            "liked_products": liked_products,
        }
    )
def best_selling_products(request):

    products = (
        Products.objects
        .filter(
            status=True,
            cart_items__quantity__gte=1
        )
        .annotate(
            total_sold=Sum("cart_items__quantity")
        )
        .filter(
            total_sold__gte=1
        )
        .order_by(
            "-total_sold",
            "-created_date"
        )
    )

    return render(
        request,
        "best_sells.html",
        {
            "products": products
        }
    )
@property
def discounted_price(self):
    if self.discount_percent:
        return int(
            self.price - (self.price * self.discount_percent / 100)
        )

    return self.price