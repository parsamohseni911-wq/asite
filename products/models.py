from django.db import models
from django.contrib.auth.models import User


class Brand(models.Model):
    name = models.CharField(max_length=255)

    image = models.ImageField(
        upload_to="brands/",
        null=True,
        blank=True
    )

    def str(self):
        return self.name


class Category(models.Model):
   name= models.CharField(max_length=255)

   def __str__(self):
     return self.name
   


class Products(models.Model):
    name = models.CharField(max_length=255)

    information = models.CharField(max_length=255)

    price = models.PositiveBigIntegerField()

    inventory = models.PositiveIntegerField(default=0)

    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )

    image = models.ImageField(
        upload_to="products/"
    )

    category = models.ManyToManyField(
        Category,
        blank=True,
        related_name="products"
    )

    created_date = models.DateTimeField(auto_now_add=True)

    updated_date = models.DateTimeField(auto_now=True)

    status = models.BooleanField(default=False)

    # فعال بودن تخفیف
    offer = models.BooleanField(default=False)

    # درصد تخفیف، مثلا 10 یا 25 یا 50
    discount_percent = models.PositiveIntegerField(
        default=0
    )

    waranty = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    def str(self):
        return f"{self.name},{self.id}"

    @property
    def discounted_price(self):
        """
        قیمت بعد از تخفیف
        """

        if self.offer and self.discount_percent > 0:

            discount = (
                self.price * self.discount_percent
            ) / 100

            return int(self.price - discount)

        return self.price

    @property
    def discount_amount(self):
        """
        مقدار پولی تخفیف
        """

        if self.offer and self.discount_percent > 0:

            return int(
                self.price * self.discount_percent / 100
            )

        return 0
class ProductImage(models.Model):
    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return self.product.name

class ProductFeature(models.Model):
    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name='features'
    )
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.name}: {self.value}'