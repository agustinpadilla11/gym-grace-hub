export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  category: string[];
  participants: TournamentParticipant[];
  createdAt: string;
}

export interface TournamentParticipant {
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  payment: TournamentPayment;
}

export interface TournamentPayment {
  id: string;
  date: string;
  amount: number;
  method: 'transferencia' | 'efectivo';
  status: 'paid' | 'partial' | 'pending';
  observation: string;
  dueDate?: string;
}

export interface TournamentFormData {
  name: string;
  date: string;
  location: string;
  category: string[];
}

export interface ParticipantFormData {
  studentName: string;
  level: string;
  paymentDate: string;
  paymentAmount: number;
  paymentMethod: 'transferencia' | 'efectivo';
  paymentStatus: 'paid' | 'partial' | 'pending';
  observation: string;
}