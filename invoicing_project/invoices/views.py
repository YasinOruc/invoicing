# invoices/views.py

from rest_framework import viewsets
from .models import Invoice
from .serializers import InvoiceSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        html = render_to_string('invoice_pdf.html', {'invoice': invoice})

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
        pisa_status = pisa.CreatePDF(html, dest=response)
        
        if pisa_status.err:
            error_msg = f'Error generating PDF for Invoice {invoice.invoice_number}'
            return HttpResponse(error_msg, status=500)
        
        return response
