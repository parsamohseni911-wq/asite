from django.contrib import admin
from products.views import *
from products.models import *
# Register your models here.


class ProductAdmin(admin.ModelAdmin):
    date_hierarchy = 'created_date'
    empty_value_display = '-empty-'

    list_filter = ('status',)
    ordering =['-created_date']
    search_fields = ['name']
    


admin.site.register(ProductFeature)
admin.site.register(ProductImage)
admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Products,ProductAdmin)