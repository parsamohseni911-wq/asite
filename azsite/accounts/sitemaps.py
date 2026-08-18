from django.contrib import sitemaps
from django.urls import reverse
from products.models import Products


class StaticViewSitemap(sitemaps.Sitemap):
    priority = 0.5
    changefreq = "daily"

    def items(self):
        return [
            "accounts:indexone",
            "accounts:about_us",
        ]

    def location(self, item):
        return reverse(item)


class ProductsSitemap(sitemaps.Sitemap):
    changefreq = "weekly"
    priority = 0.5

    def items(self):
        return Products.objects.filter(
            status=True
        )

    def lastmod(self, obj):
        return obj.created_date

    def location(self, obj):
        return reverse(
            "products:single_product",
            kwargs={
                "pid": obj.id
            }
        )