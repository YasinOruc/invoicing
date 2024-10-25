'use client';

import { useState, useEffect } from 'react';
import api from '../api';
import { useRouter } from 'next/navigation';
import { Invoice } from '../types/invoice';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, FileDown, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';

// Main InvoiceDashboard component
export default function InvoiceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const router = useRouter();

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

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

  // Handle delete confirmation
  const handleDeleteClick = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      api
        .delete(`invoices/${invoiceToDelete.invoice_number}/`)
        .then(() => {
          alert('Invoice deleted successfully');
          setDeleteDialogOpen(false);
          setInvoiceToDelete(null);
          fetchInvoices(); // Refresh invoice list after deletion
        })
        .catch((error) => {
          console.error('Error deleting invoice:', error);
        });
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-gray-900">Invoices</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                className="ml-4 bg-black text-white hover:bg-gray-800"
                onClick={() => router.push('/invoices/create')}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and filters */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-black focus:border-black"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">{filteredInvoices.length} Total Invoices</span>
        </div>

        {/* Invoice table */}
        {filteredInvoices.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold uppercase text-xs">Invoice Number</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Client Name</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Date Created</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Due Date</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Total Amount (€)</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => (
                  <TableRow key={invoice.invoice_number} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.due_date}</TableCell>
                    <TableCell>€{invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.invoice_number}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.invoice_number}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(invoice)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
            <div className="mt-6">
              <Button
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => router.push('/invoices/create')}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sureHere’s the continuation and completion of the code with the delete confirmation functionality:

```typescript
              Are you sure you want to delete invoice {invoiceToDelete?.invoice_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between text-sm text-gray-500">
            <div>© 2024 Invoice Manager</div>
            <div>
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <span className="mx-2">|</span>
              <a href="#" className="hover:text-gray-700">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
