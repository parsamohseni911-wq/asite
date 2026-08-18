from accounts.models import *


def user_sidebar(request):
    if not request.user.is_authenticated:
        return {}

    account, created = Account.objects.get_or_create(
        user=request.user
    )

    likes, created = Likes.objects.get_or_create(
        contact=account
    )

    likes_count = likes.product.count()

    return {
        "sidebar_account": account,
        "sidebar_likes_count": likes_count,
    }