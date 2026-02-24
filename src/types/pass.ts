export interface Pass {
  id: string;
  nombreCompleto: string;
  gimnasioTraspaso: string;
  fecha: string;
  monto: number;
  medioPago: 'transferencia' | 'efectivo';
  fechaCreacion: Date;
}