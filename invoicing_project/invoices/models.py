from django.db import models

class Invoice(models.Model):
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()

    def __str__(self):
        return f"Invoice {self.id} - {self.client_name}"
