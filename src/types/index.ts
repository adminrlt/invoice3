// Add to existing types
export interface Invoice {
  id: string;
  invoiceNumber?: string;
  fileUrl: string;
  pageNumber: number;
  createdAt: string;
  vendorName?: string;
  bankName?: string;
  invoiceDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  subtotal?: number;
  summary?: string;
  status?: string;
  error_message?: string;
}