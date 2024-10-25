// src/app/invoices/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import api from '../../../api';
import { Invoice } from '../../../types/invoice';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    api
      .get(`invoices/${id}/`)
      .then((response) => setInvoice(response.data))
      .catch((error) => console.error(error));
  }, [id]);

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Invoice {invoice.invoice_number}</h1>
      {/* Client Information */}
      <p>
        <strong>Client Name:</strong> {invoice.client_name}
      </p>
      <p>
        <strong>Client Email:</strong> {invoice.client_email}
      </p>
      {/* Invoice Information */}
      <p>
        <strong>Date:</strong> {invoice.date}
      </p>
      <p>
        <strong>Due Date:</strong> {invoice.due_date}
      </p>
      <p>
        <strong>VAT Rate:</strong> {invoice.vat_rate}%
      </p>
      {/* Items */}
      <h2 className="text-xl font-bold mt-8 mb-4">Items</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Unit Price (€)</th>
            <th className="border px-4 py-2">Total Price (€)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{item.description}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">{parseFloat(item.unit_price.toString()).toFixed(2)}</td>
              <td className="border px-4 py-2">
                {(item.quantity * parseFloat(item.unit_price.toString())).toFixed(2)}
              </td>
            </tr>
          ))}
          {/* Summary */}
          <tr>
            <td colSpan={3} className="border px-4 py-2 font-bold text-right">
              Subtotal
            </td>
            {/* Oplossing: Zet subtotal om naar een getal en behandel null/undefined als 0 */}
            <td className="border px-4 py-2">{parseFloat(invoice.subtotal?.toString() || '0').toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="border px-4 py-2 font-bold text-right">
              VAT ({invoice.vat_rate}%)
            </td>
            <td className="border px-4 py-2">{parseFloat(invoice.vat_amount?.toString() || '0').toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="border px-4 py-2 font-bold text-right">
              Total
            </td>
            <td className="border px-4 py-2">{parseFloat(invoice.total_amount?.toString() || '0').toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <a
        href={`http://localhost:8000/api/invoices/${invoice.invoice_number}/pdf/`}
        className="text-blue-500 mt-4 inline-block"
      >
        Download PDF
      </a>
    </div>
  );
}
