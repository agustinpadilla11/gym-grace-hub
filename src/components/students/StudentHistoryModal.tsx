import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Student, PaymentRecord } from "@/types/student";
import { Calendar, CreditCard, DollarSign } from "lucide-react";

interface StudentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
}

export const StudentHistoryModal = ({ isOpen, onClose, student }: StudentHistoryModalProps) => {
  if (!student) return null;

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pagado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Vencido</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: PaymentRecord['paymentMethod']) => {
    return method === 'transferencia' ? 
      <Badge variant="secondary">Transferencia</Badge> : 
      <Badge variant="secondary">Efectivo</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS' 
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial de Pagos - {student.fullName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Nivel:</span>
                <span className="capitalize">{student.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Federación:</span>
                <Badge 
                  variant="outline" 
                  className={
                    student.federation.status === 'active' 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : student.federation.status === 'pending'
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {student.federation.status === 'active' ? 'Activa' : 
                   student.federation.status === 'pending' ? 'Pendiente' : 'Inactiva'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Teléfono:</span>
                <span>{student.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Historial de Pagos
            </h3>
            
            {student.paymentHistory.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {new Date(payment.date).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell>{payment.concept}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {getPaymentMethodBadge(payment.paymentMethod)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay registros de pagos para esta alumna</p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          {student.paymentHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">
                  {student.paymentHistory.filter(p => p.status === 'paid').length}
                </div>
                <div className="text-sm text-green-600">Pagos Realizados</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-700">
                  {student.paymentHistory.filter(p => p.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-600">Pagos Pendientes</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(
                    student.paymentHistory
                      .filter(p => p.status === 'paid')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
                <div className="text-sm text-blue-600">Total Pagado</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};