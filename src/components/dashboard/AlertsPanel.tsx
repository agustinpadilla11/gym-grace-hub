import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileX, DollarSign, Users, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "payment" | "certificate" | "tournament" | "merchandise";
  title: string;
  description: string;
  studentName: string;
  dueDate: string;
  amount?: string;
  checked: boolean;
  urgent: boolean;
  source: 'cuotas' | 'students' | 'tournaments' | 'merchandising';
  sourceId: string;
}

export const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Configurar actualización automática cada 5 minutos
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAlerts: Alert[] = [];
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // 1. Cuotas vencidas
      const { data: cuotasVencidas } = await supabase
        .from('cuotas')
        .select('*')
        .eq('user_id', user.id)
        .neq('estado', 'pagado')
        .lt('vencimiento', today.toISOString().split('T')[0]);

      cuotasVencidas?.forEach(cuota => {
        newAlerts.push({
          id: `cuota-${cuota.id}`,
          type: "payment",
          title: "Cuota Vencida",
          description: `Cuota del grupo ${cuota.grupo}`,
          studentName: cuota.alumna,
          dueDate: cuota.vencimiento,
          amount: `$${cuota.monto}`,
          checked: false,
          urgent: true,
          source: 'cuotas',
          sourceId: cuota.id
        });
      });

      // 2. Certificados médicos vencidos o por vencer
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .not('medical_certificate_expiry_date', 'is', null)
        .lt('medical_certificate_expiry_date', in30Days.toISOString().split('T')[0]);

      students?.forEach(student => {
        const expiryDate = new Date(student.medical_certificate_expiry_date);
        const isExpired = expiryDate < today;
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        newAlerts.push({
          id: `cert-${student.id}`,
          type: "certificate",
          title: isExpired ? "Certificado Médico Vencido" : "Certificado Médico por Vencer",
          description: isExpired ? "Certificado vencido" : `Vence en ${daysUntilExpiry} días`,
          studentName: student.full_name,
          dueDate: student.medical_certificate_expiry_date,
          checked: false,
          urgent: isExpired || daysUntilExpiry <= 7,
          source: 'students',
          sourceId: student.id
        });
      });

      // 3. Pagos parciales de torneos
      const { data: torneosPartial } = await supabase
        .from('tournament_participants')
        .select('*, tournaments(name)')
        .eq('user_id', user.id)
        .eq('payment_status', 'partial');

      torneosPartial?.forEach(participant => {
        const remainingAmount = (participant.payment_amount || 0) - (participant.payment_amount || 0);
        if (remainingAmount > 0) {
          newAlerts.push({
            id: `tournament-${participant.id}`,
            type: "tournament",
            title: "Pago Parcial - Torneo",
            description: `${participant.tournaments?.name || 'Torneo'} - Falta abonar`,
            studentName: participant.student_name,
            dueDate: participant.due_date || '',
            amount: `$${remainingAmount}`,
            checked: false,
            urgent: participant.due_date ? new Date(participant.due_date) < today : false,
            source: 'tournaments',
            sourceId: participant.id
          });
        }
      });

      // 4. Pagos parciales de merchandising
      const { data: merchandisingPartial } = await supabase
        .from('merchandising_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('pago_completo', false);

      merchandisingPartial?.forEach(order => {
        newAlerts.push({
          id: `merch-${order.id}`,
          type: "merchandise",
          title: "Pago Parcial - Merchandising",
          description: `${order.producto} - Pago pendiente`,
          studentName: order.alumna,
          dueDate: order.fecha,
          amount: `$${order.monto}`,
          checked: false,
          urgent: false,
          source: 'merchandising',
          sourceId: order.id
        });
      });

      // Ordenar por urgencia y fecha
      newAlerts.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las alertas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertCheck = async (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, checked: !alert.checked } : alert
      )
    );

    // Opcional: Marcar en la base de datos que la alerta fue vista
    const alert = alerts.find(a => a.id === alertId);
    if (alert && alert.source === 'merchandising') {
      try {
        await supabase
          .from('merchandising_orders')
          .update({ alerta_enviada: true })
          .eq('id', alert.sourceId);
      } catch (error) {
        console.error('Error updating alert status:', error);
      }
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "payment":
        return DollarSign;
      case "certificate":
        return FileX;
      case "tournament":
        return Users;
      case "merchandise":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (type: Alert["type"], urgent: boolean) => {
    if (urgent) return "text-destructive";
    switch (type) {
      case "certificate":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  const getBadgeVariant = (type: Alert["type"], urgent: boolean) => {
    if (urgent) return "destructive";
    switch (type) {
      case "certificate":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Alertas y Seguimiento
          {alerts.filter(a => !a.checked).length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {alerts.filter(a => !a.checked).length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Cargando alertas...
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            ¡No hay alertas pendientes!
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => {
            const IconComponent = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  alert.checked 
                    ? "bg-muted/50 border-muted opacity-60" 
                    : alert.urgent 
                      ? "bg-destructive/5 border-destructive/20" 
                      : "bg-card border-border hover:bg-muted/30"
                }`}
              >
                <Checkbox
                  checked={alert.checked}
                  onCheckedChange={() => handleAlertCheck(alert.id)}
                  className="mt-1"
                />
                
                <div className={`w-8 h-8 rounded-lg ${alert.urgent ? 'bg-destructive/10' : 'bg-warning/10'} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`w-4 h-4 ${getAlertColor(alert.type, alert.urgent)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${alert.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {alert.title}
                    </h4>
                    <Badge variant={getBadgeVariant(alert.type, alert.urgent)} className="text-xs">
                      {alert.urgent ? "Urgente" : "Pendiente"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>{alert.studentName}</strong> - {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Vence: {formatDate(alert.dueDate)}</span>
                    {alert.amount && (
                      <span className="font-medium text-primary">{alert.amount}</span>
                    )}
                  </div>
                </div>

                {alert.checked && (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })
        )}

        {alerts.length > 5 && (
          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={fetchAlerts}>
              Ver Todas las Alertas ({alerts.length})
            </Button>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={fetchAlerts}
            >
              Actualizar Alertas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};