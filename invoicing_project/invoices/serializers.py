# invoices/serializers.py

from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    vat_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'invoice_number', 'client_name', 'client_email', 'date', 'due_date',
            'vat_rate', 'subtotal', 'vat_amount', 'total_amount', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items')
        instance.client_name = validated_data.get('client_name', instance.client_name)
        instance.client_email = validated_data.get('client_email', instance.client_email)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.vat_rate = validated_data.get('vat_rate', instance.vat_rate)
        instance.save()

        # Update invoice items
        keep_items = []
        for item_data in items_data:
            if 'id' in item_data:
                item = InvoiceItem.objects.get(id=item_data['id'], invoice=instance)
                item.description = item_data.get('description', item.description)
                item.quantity = item_data.get('quantity', item.quantity)
                item.unit_price = item_data.get('unit_price', item.unit_price)
                item.save()
                keep_items.append(item.id)
            else:
                item = InvoiceItem.objects.create(invoice=instance, **item_data)
                keep_items.append(item.id)

        # Delete items not in the request
        instance.items.exclude(id__in=keep_items).delete()

        return instance
