// src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import api from '../api';
import Link from 'next/link';
import { Invoice } from '../types/invoice';

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    api
      .get('invoices/')
      .then((response) => {
        // Ensure total_amount is always a number
        const sanitizedInvoices = response.data.map((invoice: Invoice) => ({
          ...invoice,
          total_amount: typeof invoice.total_amount === 'number' ? invoice.total_amount : 0,
        }));
        setInvoices(sanitizedInvoices);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = (invoice_number?: number) => {
    if (invoice_number && confirm('Are you sure you want to delete this invoice?')) {
      api
        .delete(`invoices/${invoice_number}/`)
        .then(() => {
          alert('Invoice deleted successfully');
          fetchInvoices();
        })
        .catch((error) => console.error(error));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <Link href="/invoices/create" className="text-blue-500 mb-4 inline-block">
        Create Invoice
      </Link>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Invoice Number</th>
              <th className="border px-4 py-2">Client Name</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Total Amount (€)</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.invoice_number}>
                <td className="border px-4 py-2">{invoice.invoice_number}</td>
                <td className="border px-4 py-2">{invoice.client_name}</td>
                <td className="border px-4 py-2">{invoice.date}</td>
                <td className="border px-4 py-2">{invoice.due_date}</td>
                <td className="border px-4 py-2">
                  {typeof invoice.total_amount === 'number' ? invoice.total_amount.toFixed(2) : '0.00'}
                </td>
                <td className="border px-4 py-2">
                  <Link href={`/invoices/${invoice.invoice_number}`} className="text-blue-500">
                    View
                  </Link>
                  {' | '}
                  <Link href={`/invoices/${invoice.invoice_number}/edit`} className="text-blue-500">
                    Edit
                  </Link>
                  {' | '}
                  <button
                    onClick={() => handleDelete(invoice.invoice_number)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                  {' | '}
                  <a
                    href={`http://localhost:8000/api/invoices/${invoice.invoice_number}/pdf/`}
                    className="text-blue-500"
                  >
                    Download PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
