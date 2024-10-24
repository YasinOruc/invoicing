// src/app/invoices/[id]/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../api';

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  date: string;
  due_date: string;
  amount: string;
  description: string;
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
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
      <h1 className="text-2xl font-bold mb-4">Invoice {invoice.id}</h1>
      <p>
        <strong>Client Name:</strong> {invoice.client_name}
      </p>
      <p>
        <strong>Client Email:</strong> {invoice.client_email}
      </p>
      <p>
        <strong>Date:</strong> {invoice.date}
      </p>
      <p>
        <strong>Due Date:</strong> {invoice.due_date}
      </p>
      <p>
        <strong>Amount:</strong> {invoice.amount}
      </p>
      <p>
        <strong>Description:</strong> {invoice.description}
      </p>
      <a
        href={`http://localhost:8000/api/invoices/${invoice.id}/pdf/`}
        className="text-blue-500"
      >
        Download PDF
      </a>
    </div>
  );
}
