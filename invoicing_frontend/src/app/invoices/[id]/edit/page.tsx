// src/app/invoices/[id]/edit/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import api from '../../../../api';
import { Invoice, InvoiceItem } from '../../../../types/invoice';

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

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!invoice) return;
  
    const fieldName = e.target.name;
    const value = e.target.value;
    const newItems = [...invoice.items];
    const item = newItems[index];
  
    switch (fieldName) {
      case 'description':
        item.description = value;
        break;
      case 'quantity':
        item.quantity = parseFloat(value);
        break;
      case 'unit_price':
        item.unit_price = parseFloat(value);
        break;
      default:
        console.warn(`Unknown field: ${fieldName}`);
        break;
    }
  
    setInvoice({ ...invoice, items: newItems });
  };
  

  const addItem = () => {
    setInvoice({
      ...invoice!,
      items: [
        ...invoice!.items,
        { description: '', quantity: 1, unit_price: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoice!.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice!, items: newItems });
  };

  const calculateSubtotal = () => {
    return invoice!.items.reduce(
      (total, item) => total + item.quantity * item.unit_price,
      0
    );
  };

  const calculateVAT = () => {
    return (calculateSubtotal() * (invoice!.vat_rate || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Invoice {invoice.invoice_number}</h1>
      <form onSubmit={handleSubmit}>
        {/* Client Information */}
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
        {/* Invoice Information */}
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
        {/* VAT Rate */}
        <div className="mb-4">
          <label className="block text-gray-700">VAT Rate (%)</label>
          <input
            type="number"
            name="vat_rate"
            value={invoice.vat_rate}
            onChange={handleChange}
            className="mt-1 p-2 border w-full"
            required
            step="0.01"
          />
        </div>
        {/* Items */}
        <h2 className="text-xl font-bold mt-8 mb-4">Items</h2>
        {invoice.items.map((item, index) => (
          <div key={index} className="mb-4 border p-4">
            <div className="flex justify-between">
              <h3 className="font-bold">Item {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500"
                disabled={invoice.items.length === 1}
              >
                Remove
              </button>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={item.description}
                onChange={(e) => handleItemChange(index, e)}
                className="mt-1 p-2 border w-full"
                required
              ></textarea>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                className="mt-1 p-2 border w-full"
                required
                min="1"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700">Unit Price (€)</label>
              <input
                type="number"
                name="unit_price"
                value={item.unit_price}
                onChange={(e) => handleItemChange(index, e)}
                className="mt-1 p-2 border w-full"
                required
                step="0.01"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="bg-green-500 text-white px-4 py-2"
        >
          Add Item
        </button>
        {/* Summary */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Summary</h2>
          <p>
            <strong>Subtotal:</strong> €{calculateSubtotal().toFixed(2)}
          </p>
          <p>
            <strong>VAT ({invoice.vat_rate}%):</strong> €
            {calculateVAT().toFixed(2)}
          </p>
          <p>
            <strong>Total:</strong> €{calculateTotal().toFixed(2)}
          </p>
        </div>
        {/* Submit */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4">
          Save
        </button>
      </form>
    </div>
  );
}
