export interface MerchandisingOrder {
  id: string;
  producto: string;
  talle: string;
  alumna: string;
  monto: number;
  montoPagado?: number; // Nuevo campo para monto parcial pagado
  medio: 'transferencia' | 'efectivo';
  observacionPago: 'completo' | 'parcial';
  observacion: string;
  fecha: string;
  entregado: boolean;
  pagoCompleto: boolean;
  fechaCreacion: Date;
  alertaEnviada?: boolean;
}

export interface MerchandisingAlert {
  id: string;
  alumna: string;
  producto: string;
  montoDeudor: number;
  fechaVencimiento: Date;
  enviada: boolean;
}