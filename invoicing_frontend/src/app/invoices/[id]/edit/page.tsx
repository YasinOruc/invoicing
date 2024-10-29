'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Percent, Trash2, Plus, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import api from '@/api';
import { Invoice, InvoiceItem } from '@/types/invoice';

interface InvoiceItemPayload {
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

interface InvoicePayload {
  client_name: string;
  client_email: string;
  due_date: string;
  vat_rate: number;
  items: InvoiceItemPayload[];
}

export default function EditInvoiceComponent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [vatRate, setVatRate] = useState(21);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await api.get<Invoice>(`/invoices/${params.id}/`);
        const { client_name, client_email, due_date, vat_rate, items } = response.data;
        setClientName(client_name);
        setClientEmail(client_email);
        setDueDate(due_date);
        setVatRate(vat_rate);
        setItems(items);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    }
    fetchInvoice();
  }, [params.id]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length <= 1) {
      toast({
        title: 'Cannot remove the last item',
        description: 'An invoice must have at least one item.',
        variant: 'destructive',
      });
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const calculateVat = () => {
    return calculateSubtotal() * (vatRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVat();
  };

  const handleSave = async () => {
    try {
      const payload: InvoicePayload = {
        client_name: clientName,
        client_email: clientEmail,
        due_date: dueDate,
        vat_rate: vatRate,
        items: items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      await api.put(`/invoices/${params.id}/`, payload);
      toast({
        title: 'Invoice Updated',
        description: `Invoice for ${clientName} has been updated successfully.`,
      });
      router.push('/');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the invoice.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster />
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Invoice</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                    Client Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-700">
                    Client Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                    Due Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatRate" className="text-sm font-medium text-gray-700">
                    VAT Rate (%)
                  </Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="vatRate"
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="bg-white shadow-sm sticky top-8">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">VAT ({vatRate}%):</span>
                  <span className="font-medium">€{calculateVat().toFixed(2)}</span>
                </div>
                <Separator />
                <motion.div
                  className="flex justify-between items-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold">€{calculateTotal().toFixed(2)}</span>
                </motion.div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSave}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
