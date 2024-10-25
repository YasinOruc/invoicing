// src/app/invoices/create/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../api';

export default function InvoiceCreatePage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState({
    client_name: '',
    client_email: '',
    due_date: '',
    amount: '',
    description: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    api
      .post('invoices/', invoice)
      .then(() => {
        alert('Invoice created successfully');
        router.push('/');
      })
      .catch((error) => console.error(error));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>
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
          Create
        </button>
      </form>
    </div>
  );
}
