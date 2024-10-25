'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import api from '../../../../api';

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  due_date: string;
  amount: string;
  description: string;
}

export default function InvoiceEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    api
      .get(`invoices/${id}/`)
      .then((response) => setInvoice(response.data))
      .catch((error) => console.error(error));
  }, [id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (invoice) {
      api
        .put(`invoices/${id}/`, invoice)
        .then(() => {
          alert('Invoice updated successfully');
          router.push('/');
        })
        .catch((error) => console.error(error));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInvoice({ ...invoice!, [e.target.name]: e.target.value });
  };

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Invoice {invoice.id}</h1>
      <form onSubmit={handleSubmit}>
        {/* Client Name */}
        <div className="mb-4">
          <label className="block text-gray-700">Client Name</label>
          <input
            type="text"
            name="client_name"
            value={invoice.client_name}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
          />
        </div>
        {/* Client Email */}
        <div className="mb-4">
          <label className="block text-gray-700">Client Email</label>
          <input
            type="email"
            name="client_email"
            value={invoice.client_email}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
          />
        </div>
        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-gray-700">Due Date</label>
          <input
            type="date"
            name="due_date"
            value={invoice.due_date}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
          />
        </div>
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={invoice.amount}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
          />
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={invoice.description}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
          ></textarea>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Save
        </button>
      </form>
    </div>
  );
}
