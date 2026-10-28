import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, DollarSign, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  title: string;
  selectedMonth?: string;
}

export const DetailModal = ({ isOpen, onClose, type, title, selectedMonth }: DetailModalProps) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && type) {
      loadRealData();
    }
  }, [isOpen, type, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData([]);
        return;
      }

      const monthStr = selectedMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      const [year, month] = monthStr.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      const today = new Date();

      if (type === "cuotas-al-dia") {
        const { data: cuotas } = await supabase
          .from('cuotas')
          .select('*')
          .eq('user_id', user.id)
          .eq('estado', 'pagado')
          .gte('fecha_pago', startDate)
          .lte('fecha_pago', endDate)
          .order('fecha_pago', { ascending: false });

        setData(
          (cuotas || []).map(c => ({
            nombre: c.alumna,
            monto: formatCurrency(c.monto),
            fechaPago: c.fecha_pago ? new Date(c.fecha_pago).toLocaleDateString('es-AR') : '-',
            estado: 'Pagado'
          }))
        );
      } else if (type === "cuotas-vencidas") {
        const { data: cuotas } = await supabase
          .from('cuotas')
          .select('*')
          .eq('user_id', user.id)
          .neq('estado', 'pagado')
          .lt('vencimiento', today.toISOString().split('T')[0])
          .order('vencimiento', { ascending: true });

        setData(
          (cuotas || []).map(c => {
            const venc = c.vencimiento ? new Date(c.vencimiento) : today;
            const diffDays = Math.max(1, Math.floor((today.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
            return {
              nombre: c.alumna,
              monto: formatCurrency(c.monto),
              fechaVencimiento: c.vencimiento ? new Date(c.vencimiento).toLocaleDateString('es-AR') : '-',
              diasVencido: diffDays
            };
          })
        );
      } else if (type === "certificados-vencidos") {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .not('medical_certificate_expiry_date', 'is', null)
          .lt('medical_certificate_expiry_date', today.toISOString().split('T')[0])
          .order('medical_certificate_expiry_date', { ascending: true });

        setData(
          (students || []).map(s => {
            const exp = new Date(s.medical_certificate_expiry_date);
            const diffDays = Math.max(1, Math.floor((today.getTime() - exp.getTime()) / (1000 * 60 * 60 * 24)));
            return {
              nombre: s.full_name,
              tipo: "Certificado Médico",
              fechaVencimiento: exp.toLocaleDateString('es-AR'),
              diasVencido: diffDays
            };
          })
        );
      } else if (type === "ingresos") {
        const [cuotasRes, pasesRes, merchRes, torneosRes] = await Promise.all([
          supabase
            .from('cuotas')
            .select('monto')
            .eq('user_id', user.id)
            .eq('estado', 'pagado')
            .gte('fecha_pago', startDate)
            .lte('fecha_pago', endDate),
          supabase
            .from('pases')
            .select('monto')
            .eq('user_id', user.id)
            .gte('fecha', startDate)
            .lte('fecha', endDate),
          supabase
            .from('merchandising_orders')
            .select('monto')
            .eq('user_id', user.id)
            .gte('fecha', startDate)
            .lte('fecha', endDate),
          supabase
            .from('tournament_participants')
            .select('payment_amount')
            .eq('user_id', user.id)
            .eq('payment_status', 'paid')
            .gte('payment_date', startDate)
            .lte('payment_date', endDate)
        ]);

        const cTotal = (cuotasRes.data || []).reduce((acc, c) => acc + (c.monto || 0), 0);
        const pTotal = (pasesRes.data || []).reduce((acc, p) => acc + (p.monto || 0), 0);
        const mTotal = (merchRes.data || []).reduce((acc, m) => acc + (m.monto || 0), 0);
        const tTotal = (torneosRes.data || []).reduce((acc, t) => acc + (t.payment_amount || 0), 0);
        const total = cTotal + pTotal + mTotal + tTotal;

        const breakdown = [
          {
            concepto: "Cuotas Mensuales",
            monto: formatCurrency(cTotal),
            cantidad: (cuotasRes.data || []).length.toString(),
            porcentaje: total > 0 ? `${((cTotal / total) * 100).toFixed(1)}%` : "0%"
          },
          {
            concepto: "Inscripciones / Pases",
            monto: formatCurrency(pTotal),
            cantidad: (pasesRes.data || []).length.toString(),
            porcentaje: total > 0 ? `${((pTotal / total) * 100).toFixed(1)}%` : "0%"
          },
          {
            concepto: "Torneos",
            monto: formatCurrency(tTotal),
            cantidad: (torneosRes.data || []).length.toString(),
            porcentaje: total > 0 ? `${((tTotal / total) * 100).toFixed(1)}%` : "0%"
          },
          {
            concepto: "Merchandising",
            monto: formatCurrency(mTotal),
            cantidad: (merchRes.data || []).length.toString(),
            porcentaje: total > 0 ? `${((mTotal / total) * 100).toFixed(1)}%` : "0%"
          }
        ];
        setData(breakdown);
      }
    } catch (err) {
      console.error("Error loading detail data:", err);
      setData([]);
    } finally {
      setIsLoading(false);
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
            <TableHead><User className="w-4 h-4 inline mr-2" />Registros</TableHead>
            <TableHead>Porcentaje</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRows = (type: string, rows: any[]) => {
    switch (type) {
      case "cuotas-al-dia":
        return rows.map((item, index) => (
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
        return rows.map((item, index) => (
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
        return rows.map((item, index) => (
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
        return rows.map((item, index) => (
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title} - Detalle
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span>Cargando información...</span>
            </div>
          ) : (
            <>
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
                  No hay registros disponibles para este período
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
