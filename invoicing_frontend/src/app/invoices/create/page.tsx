// src/app/invoices/create/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../api';
import { Invoice, InvoiceItem } from '../../../types/invoice';

export default function InvoiceCreatePage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice>({
    client_name: '',
    client_email: '',
    due_date: '',
    vat_rate: 21,
    items: [
      {
        description: '',
        quantity: 1,
        unit_price: 0,
      },
    ],
  });

  const handleSubmit = async (e: FormEvent, action: string) => {
    e.preventDefault();

    try {
      // Ensure that all items are properly formatted
      const formattedInvoice = {
        ...invoice,
        items: invoice.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      // Save the invoice
      const response = await api.post('invoices/', formattedInvoice);
      const savedInvoice = response.data;

      if (action === 'save') {
        alert('Invoice saved successfully');
        router.push('/');
      } else if (action === 'save_download') {
        // Download the PDF
        const pdfResponse = await api.get(`invoices/${savedInvoice.invoice_number}/pdf/`, {
          responseType: 'blob', // Important for downloading files
        });

        // Create a URL for the PDF blob
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }));

        // Create a link and trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${savedInvoice.invoice_number}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        alert('Invoice saved and PDF downloaded successfully');
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving the invoice.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const fieldName = e.target.name;
    const value = e.target.value;
    const newItems = [...invoice.items];
    const item = newItems[index];

    switch (fieldName) {
      case 'description':
        item.description = value;
        break;
      case 'quantity':
        item.quantity = parseFloat(value) || 0;
        break;
      case 'unit_price':
        item.unit_price = parseFloat(value) || 0;
        break;
      default:
        console.warn(`Unknown field: ${fieldName}`);
        break;
    }

    setInvoice({ ...invoice, items: newItems });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { description: '', quantity: 1, unit_price: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce(
      (total, item) => total + item.quantity * item.unit_price,
      0
    );
  };

  const calculateVAT = () => {
    return (calculateSubtotal() * (invoice.vat_rate || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>
      <form>
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
        {/* Buttons */}
        <div className="mt-4 flex space-x-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'save')}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Save
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'save_download')}
            className="bg-green-500 text-white px-4 py-2"
          >
            Save & Download PDF
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
