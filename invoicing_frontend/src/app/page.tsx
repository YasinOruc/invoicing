// src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import api from '../api';
import Link from 'next/link';

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  date: string;
  due_date: string;
  amount: string;
  description: string;
}

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    api
      .get('invoices/')
      .then((response) => setInvoices(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <Link href="/invoices/create" className="text-blue-500 mb-4 inline-block">
        Create Invoice
      </Link>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Client Name</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Due Date</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="border px-4 py-2">{invoice.client_name}</td>
              <td className="border px-4 py-2">{invoice.amount}</td>
              <td className="border px-4 py-2">{invoice.due_date}</td>
              <td className="border px-4 py-2">
                <Link href={`/invoices/${invoice.id}`} className="text-blue-500">
                  View
                </Link>
                {' | '}
                <Link href={`/invoices/${invoice.id}/edit`} className="text-blue-500">
                  Edit
                </Link>
                {' | '}
                <a
                  href={`http://localhost:8000/api/invoices/${invoice.id}/pdf/`}
                  className="text-blue-500"
                >
                  Download PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
