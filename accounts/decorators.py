from functools import wraps
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.urls import reverse
from .models import Account


def account_complete_required(view_func):

    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):

        account, created = Account.objects.get_or_create(
            user=request.user
        )

        if not all([
            account.number.strip(),
            account.adress.strip(),
            account.postcode.strip(),
        ]):
            complete_url = reverse('accounts:complete')

            return redirect(
                f'{complete_url}?next={request.get_full_path()}'
            )

        return view_func(request, *args, **kwargs)

    return wrapper