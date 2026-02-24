import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, DollarSign, AlertCircle } from "lucide-react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  title: string;
}

export const DetailModal = ({ isOpen, onClose, type, title }: DetailModalProps) => {
  const getDetailData = (type: string) => {
    switch (type) {
      case "cuotas-al-dia":
        return [
          { nombre: "María González", monto: "$25,000", fechaPago: "15/01/2026", estado: "Pagado" },
          { nombre: "Ana Rodríguez", monto: "$25,000", fechaPago: "20/01/2026", estado: "Pagado" },
          { nombre: "Sofia Martín", monto: "$30,000", fechaPago: "18/01/2026", estado: "Pagado" },
          { nombre: "Valentina López", monto: "$25,000", fechaPago: "22/01/2026", estado: "Pagado" },
          { nombre: "Camila Torres", monto: "$25,000", fechaPago: "25/01/2026", estado: "Pagado" },
          { nombre: "Isabella Díaz", monto: "$30,000", fechaPago: "12/01/2026", estado: "Pagado" },
          { nombre: "Emma Fernández", monto: "$25,000", fechaPago: "28/01/2026", estado: "Pagado" },
          { nombre: "Olivia Ruiz", monto: "$25,000", fechaPago: "16/01/2026", estado: "Pagado" },
          { nombre: "Mía Herrera", monto: "$30,000", fechaPago: "19/01/2026", estado: "Pagado" },
          { nombre: "Luna Morales", monto: "$25,000", fechaPago: "24/01/2026", estado: "Pagado" },
          { nombre: "Victoria Ramos", monto: "$25,000", fechaPago: "21/01/2026", estado: "Pagado" },
          { nombre: "Zoe Castro", monto: "$30,000", fechaPago: "26/01/2026", estado: "Pagado" }
        ];
      case "cuotas-vencidas":
        return [
          { nombre: "Lucía Mendoza", monto: "$25,000", fechaVencimiento: "10/01/2026", diasVencido: 19 },
          { nombre: "Martina Silva", monto: "$30,000", fechaVencimiento: "05/01/2026", diasVencido: 24 },
          { nombre: "Renata Vargas", monto: "$25,000", fechaVencimiento: "15/01/2026", diasVencido: 14 }
        ];
      case "certificados-vencidos":
        return [
          { nombre: "Catalina Jiménez", fechaVencimiento: "20/12/2025", diasVencido: 40, tipo: "Certificado Médico" },
          { nombre: "Antonella Peña", fechaVencimiento: "30/12/2025", diasVencido: 30, tipo: "Certificado Médico" }
        ];
      case "ingresos":
        return [
          { concepto: "Cuotas Mensuales", monto: "$300,000", cantidad: "124", porcentaje: "95.2%" },
          { concepto: "Inscripciones", monto: "$8,000", cantidad: "8", porcentaje: "2.5%" },
          { concepto: "Merchandising", monto: "$7,500", cantidad: "15", porcentaje: "2.3%" }
        ];
      default:
        return [];
    }
  };

  const renderTableHeaders = (type: string) => {
    switch (type) {
      case "cuotas-al-dia":
        return (
          <TableRow>
            <TableHead><User className="w-4 h-4 inline mr-2" />Alumna</TableHead>
            <TableHead><DollarSign className="w-4 h-4 inline mr-2" />Monto</TableHead>
            <TableHead><CalendarDays className="w-4 h-4 inline mr-2" />Fecha de Pago</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        );
      case "cuotas-vencidas":
        return (
          <TableRow>
            <TableHead><User className="w-4 h-4 inline mr-2" />Alumna</TableHead>
            <TableHead><DollarSign className="w-4 h-4 inline mr-2" />Monto</TableHead>
            <TableHead><CalendarDays className="w-4 h-4 inline mr-2" />Fecha Vencimiento</TableHead>
            <TableHead><AlertCircle className="w-4 h-4 inline mr-2" />Días Vencido</TableHead>
          </TableRow>
        );
      case "certificados-vencidos":
        return (
          <TableRow>
            <TableHead><User className="w-4 h-4 inline mr-2" />Alumna</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead><CalendarDays className="w-4 h-4 inline mr-2" />Fecha Vencimiento</TableHead>
            <TableHead><AlertCircle className="w-4 h-4 inline mr-2" />Días Vencido</TableHead>
          </TableRow>
        );
      case "ingresos":
        return (
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead><DollarSign className="w-4 h-4 inline mr-2" />Monto</TableHead>
            <TableHead><User className="w-4 h-4 inline mr-2" />Cantidad Alumnas</TableHead>
            <TableHead>Porcentaje</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRows = (type: string, data: any[]) => {
    switch (type) {
      case "cuotas-al-dia":
        return data.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.nombre}</TableCell>
            <TableCell>{item.monto}</TableCell>
            <TableCell>{item.fechaPago}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {item.estado}
              </Badge>
            </TableCell>
          </TableRow>
        ));
      case "cuotas-vencidas":
        return data.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.nombre}</TableCell>
            <TableCell>{item.monto}</TableCell>
            <TableCell>{item.fechaVencimiento}</TableCell>
            <TableCell>
              <Badge variant="destructive">
                {item.diasVencido} días
              </Badge>
            </TableCell>
          </TableRow>
        ));
      case "certificados-vencidos":
        return data.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.nombre}</TableCell>
            <TableCell>{item.tipo}</TableCell>
            <TableCell>{item.fechaVencimiento}</TableCell>
            <TableCell>
              <Badge variant="destructive">
                {item.diasVencido} días
              </Badge>
            </TableCell>
          </TableRow>
        ));
      case "ingresos":
        return data.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.concepto}</TableCell>
            <TableCell>{item.monto}</TableCell>
            <TableCell className="font-semibold text-primary">{item.cantidad}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {item.porcentaje}
              </Badge>
            </TableCell>
          </TableRow>
        ));
      default:
        return null;
    }
  };

  const data = getDetailData(type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title} - Detalle
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <Table>
            <TableHeader>
              {renderTableHeaders(type)}
            </TableHeader>
            <TableBody>
              {renderTableRows(type, data)}
            </TableBody>
          </Table>

          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};