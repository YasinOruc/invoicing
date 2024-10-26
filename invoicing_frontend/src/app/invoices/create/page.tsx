// src/app/invoices/create/page.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Save,
  Download,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
// import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import api from '../../../api';
import { Invoice, InvoiceItem } from '../../../types/invoice';

interface InvoiceItemComponentProps {
  item: InvoiceItem;
  onUpdate: (
    id: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  onRemove: (id: number) => void;
}

const InvoiceItemComponent: React.FC<InvoiceItemComponentProps> = React.memo(
  ({ item, onUpdate, onRemove }) => {
    return (
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="space-y-2 md:col-span-6">
              <Label
                htmlFor={`description-${item.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Input
                id={`description-${item.id}`}
                value={item.description}
                onChange={(e) =>
                  onUpdate(item.id, 'description', e.target.value)
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor={`quantity-${item.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Quantity
              </Label>
              <Input
                id={`quantity-${item.id}`}
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onUpdate(item.id, 'quantity', Number(e.target.value))
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label
                htmlFor={`unit_price-${item.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Unit Price (€)
              </Label>
              <Input
                id={`unit_price-${item.id}`}
                type="number"
                value={item.unit_price}
                onChange={(e) =>
                  onUpdate(item.id, 'unit_price', Number(e.target.value))
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-1">
              <Button
                onClick={() => onRemove(item.id)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                aria-label={`Remove item ${item.description}`}
                disabled={false}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

interface SummaryProps {
  subtotal: number;
  vat: number;
  total: number;
}

const Summary: React.FC<SummaryProps> = ({ subtotal, vat, total }) => {
  return (
    <Card className="bg-gray-50 border border-gray-200 w-full md:w-64">
      <CardContent className="p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">VAT:</span>
            <span className="font-medium">€{vat.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <motion.span
              key={total}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              €{total.toFixed(2)}
            </motion.span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InvoiceCreatePage() {
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice>({
    client_name: '',
    client_email: '',
    due_date: '',
    vat_rate: 21,
    items: [{ id: 1, description: '', quantity: 1, unit_price: 0 }],
  });

  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id:
        invoice.items.length > 0
          ? Math.max(...invoice.items.map((item) => item.id)) + 1
          : 1,
      description: '',
      quantity: 1,
      unit_price: 0,
    };
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: [...prevInvoice.items, newItem],
    }));
  }, [invoice.items]);

  const removeItem = useCallback(
    (id: number) => {
      if (invoice.items.length === 1) {
        toast({
          title: 'Cannot remove the last item',
          description: 'An invoice must have at least one item.',
          status: 'warning',
        });
        return;
      }
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        items: prevInvoice.items.filter((item) => item.id !== id),
      }));
    },
    [invoice.items]
  );

  const updateItem = useCallback(
    (id: number, field: keyof InvoiceItem, value: string | number) => {
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        items: prevInvoice.items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      }));
    },
    []
  );

  const subtotal = useMemo(() => {
    return invoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  }, [invoice.items]);

  const vat = useMemo(() => {
    return (subtotal * invoice.vat_rate) / 100;
  }, [subtotal, invoice.vat_rate]);

  const total = useMemo(() => {
    return subtotal + vat;
  }, [subtotal, vat]);

  const handleSubmit = async (action: string) => {
    try {
      const formattedInvoice = {
        ...invoice,
        items: invoice.items.map(({ id, ...item }) => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      const response = await api.post('invoices/', formattedInvoice);
      const savedInvoice = response.data;

      if (action === 'save') {
        toast({
          title: 'Invoice Saved',
          description: `Invoice for ${invoice.client_name} has been saved.`,
        });
        router.push('/');
      } else if (action === 'save_download') {
        const pdfResponse = await api.get(
          `invoices/${savedInvoice.invoice_number}/pdf/`,
          {
            responseType: 'blob',
          }
        );

        const url = window.URL.createObjectURL(
          new Blob([pdfResponse.data], { type: 'application/pdf' })
        );

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `invoice_${savedInvoice.invoice_number}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        toast({
          title: 'Invoice Saved and Downloaded',
          description: `Invoice for ${invoice.client_name} has been saved and downloaded.`,
        });
        router.push('/');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data);
      } else if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Unexpected error', error);
      }
      toast({
        title: 'Error',
        description: 'An error occurred while saving the invoice.',
        status: 'error',
      });
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 text-gray-500 hover:text-gray-700"
                onClick={() => router.push('/')}
                aria-label="Go back to invoices"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Create New Invoice
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-lg">
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit('save');
            }}
          >
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="client_name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Client Name *
                  </Label>
                  <Input
                    id="client_name"
                    value={invoice.client_name}
                    onChange={(e) =>
                      setInvoice({ ...invoice, client_name: e.target.value })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="client_email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Client Email *
                  </Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={invoice.client_email}
                    onChange={(e) =>
                      setInvoice({ ...invoice, client_email: e.target.value })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="due_date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Due Date *
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoice.due_date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, due_date: e.target.value })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="vat_rate"
                    className="text-sm font-medium text-gray-700 flex items-center"
                  >
                    VAT Rate (%) *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 inline-block ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Enter the VAT rate as a percentage (e.g., 21 for 21%
                            VAT)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="vat_rate"
                    type="number"
                    value={invoice.vat_rate}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        vat_rate: Number(e.target.value),
                      })
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full"
                    required
                  />
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Invoice Items
                  </h3>
                  <Button
                    type="button"
                    onClick={addItem}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>
                <AnimatePresence>
                  {invoice.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <InvoiceItemComponent
                        item={item}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Separator className="my-8" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
                <div></div>
                <Summary subtotal={subtotal} vat={vat} total={total} />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 px-6 py-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('save')}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit('save_download')}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" /> Save & Download
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
