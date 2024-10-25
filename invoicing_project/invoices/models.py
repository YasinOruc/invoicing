# invoices/models.py

from django.db import models

class Invoice(models.Model):
    invoice_number = models.AutoField(primary_key=True)
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=21.00)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.client_name}"

    @property
    def subtotal(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def vat_amount(self):
        return round((self.subtotal * self.vat_rate) / 100, 2)

    @property
    def total_amount(self):
        return round(self.subtotal + self.vat_amount, 2)


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.TextField()
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_price(self):
        return round(self.quantity * self.unit_price, 2)

    def __str__(self):
        return f"Item {self.id} for Invoice {self.invoice.invoice_number}"
