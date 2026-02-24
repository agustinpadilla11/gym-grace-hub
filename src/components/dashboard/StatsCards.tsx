import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, AlertTriangle, Clock, TrendingUp, Calendar } from "lucide-react";
import { DetailModal } from "./DetailModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const StatsCards = () => {
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [selectedModal, setSelectedModal] = useState<{
    isOpen: boolean;
    type: string;
    title: string;
  }>({ isOpen: false, type: "", title: "" });
  
  const [stats, setStats] = useState({
    cuotasAlDia: 0,
    cuotasVencidas: 0,
    certificadosVencidos: 0,
    ingresos: 0,
    studentsCount: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedMonth]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener datos del mes seleccionado
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      // Cuotas al día y vencidas
      const { data: cuotas } = await supabase
        .from('cuotas')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha_pago', startDate.toISOString().split('T')[0])
        .lte('fecha_pago', endDate.toISOString().split('T')[0]);

      // Estudiantes con certificados médicos
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id);

      // Ingresos del mes (cuotas + pases + torneos + merchandising)
      const { data: pases } = await supabase
        .from('pases')
        .select('monto')
        .eq('user_id', user.id)
        .gte('fecha', startDate.toISOString().split('T')[0])
        .lte('fecha', endDate.toISOString().split('T')[0]);

      const { data: merchandising } = await supabase
        .from('merchandising_orders')
        .select('monto')
        .eq('user_id', user.id)
        .gte('fecha', startDate.toISOString().split('T')[0])
        .lte('fecha', endDate.toISOString().split('T')[0]);

      const { data: torneos } = await supabase
        .from('tournament_participants')
        .select('payment_amount')
        .eq('user_id', user.id)
        .eq('payment_status', 'paid')
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0]);

      // Calcular estadísticas
      const today = new Date();
      const cuotasPagadas = cuotas?.filter(c => c.estado === 'pagado') || [];
      const cuotasVencidas = cuotas?.filter(c => {
        if (!c.vencimiento) return false;
        const vencimiento = new Date(c.vencimiento);
        return vencimiento < today && c.estado !== 'pagado';
      }) || [];

      const certificadosVencidos = students?.filter(s => {
        if (!s.medical_certificate_expiry_date) return false;
        const expiry = new Date(s.medical_certificate_expiry_date);
        return expiry < today;
      }) || [];

      // Calcular ingresos totales
      const ingresosCuotas = cuotasPagadas.reduce((sum, c) => sum + (c.monto || 0), 0);
      const ingresosPases = pases?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0;
      const ingresosMerchandising = merchandising?.reduce((sum, m) => sum + (m.monto || 0), 0) || 0;
      const ingresosTorneos = torneos?.reduce((sum, t) => sum + (t.payment_amount || 0), 0) || 0;
      const ingresosTotal = ingresosCuotas + ingresosPases + ingresosMerchandising + ingresosTorneos;

      setStats({
        cuotasAlDia: cuotasPagadas.length,
        cuotasVencidas: cuotasVencidas.length,
        certificadosVencidos: certificadosVencidos.length,
        ingresos: ingresosTotal,
        studentsCount: students?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const dashboardStats = [
    {
      title: "Cuotas al Día",
      value: isLoading ? "..." : stats.cuotasAlDia.toString(),
      icon: Check,
      bgColor: "bg-green-500",
      type: "cuotas-al-dia"
    },
    {
      title: "Cuotas Vencidas", 
      value: isLoading ? "..." : stats.cuotasVencidas.toString(),
      icon: AlertTriangle,
      bgColor: "bg-red-500",
      type: "cuotas-vencidas"
    },
    {
      title: "Certificados Vencidos",
      value: isLoading ? "..." : stats.certificadosVencidos.toString(),
      icon: Clock,
      bgColor: "bg-orange-500", 
      type: "certificados-vencidos"
    },
    {
      title: "Ingresos del Mes",
      value: isLoading ? "..." : formatCurrency(stats.ingresos),
      icon: TrendingUp,
      bgColor: "bg-blue-500",
      type: "ingresos"
    }
  ];

  const handleCardClick = (stat: any) => {
    setSelectedModal({
      isOpen: true,
      type: stat.type,
      title: stat.title
    });
  };

  const closeModal = () => {
    setSelectedModal({ isOpen: false, type: "", title: "" });
  };

  return (
    <>
      <div className="space-y-4">
        <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Resumen General</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-12">Diciembre 2026</SelectItem>
                  <SelectItem value="2026-11">Noviembre 2026</SelectItem>
                  <SelectItem value="2026-10">Octubre 2026</SelectItem>
                  <SelectItem value="2026-09">Septiembre 2026</SelectItem>
                  <SelectItem value="2026-08">Agosto 2026</SelectItem>
                  <SelectItem value="2026-07">Julio 2026</SelectItem>
                  <SelectItem value="2026-06">Junio 2026</SelectItem>
                  <SelectItem value="2026-05">Mayo 2026</SelectItem>
                  <SelectItem value="2026-04">Abril 2026</SelectItem>
                  <SelectItem value="2026-03">Marzo 2026</SelectItem>
                  <SelectItem value="2026-02">Febrero 2026</SelectItem>
                  <SelectItem value="2026-01">Enero 2026</SelectItem>
                  <SelectItem value="2025-12">Diciembre 2025</SelectItem>
                  <SelectItem value="2025-11">Noviembre 2025</SelectItem>
                  <SelectItem value="2025-10">Octubre 2025</SelectItem>
                  <SelectItem value="2025-09">Septiembre 2025</SelectItem>
                  <SelectItem value="2025-08">Agosto 2025</SelectItem>
                  <SelectItem value="2025-07">Julio 2025</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
        </Card>

        {dashboardStats.map((stat, index) => (
          <Card 
            key={index} 
            className={`border-0 ${stat.bgColor} text-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`}
            onClick={() => handleCardClick(stat)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white/90 mb-2">
                    {stat.title}
                  </h3>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-sm text-white/70 mt-1">Click para ver detalles</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <DetailModal
        isOpen={selectedModal.isOpen}
        onClose={closeModal}
        type={selectedModal.type}
        title={selectedModal.title}
      />
    </>
  );
};