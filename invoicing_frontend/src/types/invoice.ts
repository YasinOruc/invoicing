export interface InvoiceItem {
  id: number; 
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export interface Invoice {
  invoice_number?: number;
  client_name: string;
  client_email: string;
  date?: string;
  due_date: string;
  vat_rate: number;
  subtotal?: number;
  vat_amount?: number;
  total_amount?: number;
  items: InvoiceItem[];
}
