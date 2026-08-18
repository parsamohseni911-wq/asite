
from django import forms
from accounts.models import Account, Coment

class AccountForm(forms.ModelForm):
    email = forms.EmailField(
    required=False,
    label="ایمیل"
)

    class Meta:
        model = Account
        fields = [
        "number",
        "adress",
        "postcode",
    ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance and self.instance.user:
            self.fields["email"].initial = self.instance.user.email

    def save(self, commit=True):
        account = super().save(commit=commit)

        account.user.email = self.cleaned_data.get(
        "email",
        ""
    )

        account.user.save(
        update_fields=["email"]
    )

        return account

class CommentForm(forms.ModelForm):
    class Meta:
        model = Coment
        fields = ["messege"]

        widgets = {
        "messege": forms.Textarea(
            attrs={
                "class": "form-control",
                "rows": 5,
                "placeholder": "نظر خود را بنویسید..."
            }
        )
    }