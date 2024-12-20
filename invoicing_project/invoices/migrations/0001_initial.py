# Generated by Django 5.1.2 on 2024-10-25 13:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('invoice_number', models.AutoField(primary_key=True, serialize=False)),
                ('client_name', models.CharField(max_length=255)),
                ('client_email', models.EmailField(max_length=254)),
                ('date', models.DateField(auto_now_add=True)),
                ('due_date', models.DateField()),
                ('vat_rate', models.DecimalField(decimal_places=2, default=21.0, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='InvoiceItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('quantity', models.PositiveIntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='invoices.invoice')),
            ],
        ),
    ]
