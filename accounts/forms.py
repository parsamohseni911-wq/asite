from django import forms
from accounts.models import *



class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = {
            'number',
            'adress',
            'postcode',
        }


from django import forms
from .models import Coment


class CommentForm(forms.ModelForm):
    class Meta:
        model = Coment
        fields = ['messege']
        widgets = {
            'messege': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'نظر خود را بنویسید...'
            })
        }