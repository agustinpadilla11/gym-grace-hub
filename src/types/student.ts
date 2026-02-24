export interface Student {
  id: string;
  fullName: string;
  school: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  medicalCertificate: {
    status: 'active' | 'expired' | 'pending';
    expiryDate?: string;
    file?: string; // URL or base64 of the medical certificate file
  };
  federation: {
    status: 'active' | 'inactive' | 'pending';
    paymentDate?: string;
    amount?: number;
    paymentMethod?: 'transferencia' | 'efectivo';
  };
  level: string;
  paymentHistory: PaymentRecord[];
  photo?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  concept: string;
  paymentMethod: 'transferencia' | 'efectivo';
  status: 'paid' | 'pending' | 'overdue';
}

export interface StudentFormData {
  fullName: string;
  school: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  medicalCertificate: {
    status: 'active' | 'expired' | 'pending';
    expiryDate: string;
    file?: string;
  };
  federation: {
    status: 'active' | 'inactive' | 'pending';
    paymentDate: string;
    amount: number;
    paymentMethod: 'transferencia' | 'efectivo';
  };
  level: string;
  photo?: string;
}