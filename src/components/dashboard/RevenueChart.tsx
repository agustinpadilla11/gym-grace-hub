import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const RevenueChart = () => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedYear]);

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Crear array de meses
      const months = [
        { name: 'Ene', num: 1 }, { name: 'Feb', num: 2 }, { name: 'Mar', num: 3 },
        { name: 'Abr', num: 4 }, { name: 'May', num: 5 }, { name: 'Jun', num: 6 },
        { name: 'Jul', num: 7 }, { name: 'Ago', num: 8 }, { name: 'Sep', num: 9 },
        { name: 'Oct', num: 10 }, { name: 'Nov', num: 11 }, { name: 'Dic', num: 12 }
      ];

      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const startDate = new Date(parseInt(selectedYear), month.num - 1, 1);
          const endDate = new Date(parseInt(selectedYear), month.num, 0);
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];

          // Obtener cuotas
          const { data: cuotas } = await supabase
            .from('cuotas')
            .select('monto')
            .eq('user_id', user.id)
            .eq('estado', 'pagado')
            .gte('fecha_pago', startDateStr)
            .lte('fecha_pago', endDateStr);

          // Obtener inscripciones (pases)
          const { data: inscripciones } = await supabase
            .from('pases')
            .select('monto')
            .eq('user_id', user.id)
            .gte('fecha', startDateStr)
            .lte('fecha', endDateStr);

          // Obtener merchandising
          const { data: merchandising } = await supabase
            .from('merchandising_orders')
            .select('monto')
            .eq('user_id', user.id)
            .gte('fecha', startDateStr)
            .lte('fecha', endDateStr);

          const cuotasTotal = cuotas?.reduce((sum, c) => sum + (c.monto || 0), 0) || 0;
          const inscripcionesTotal = inscripciones?.reduce((sum, i) => sum + (i.monto || 0), 0) || 0;
          const merchandisingTotal = merchandising?.reduce((sum, m) => sum + (m.monto || 0), 0) || 0;

          // Para renovaciones, asumimos que son pases del año actual (como renovación anual)
          const renovacionTotal = inscripcionesTotal * 0.3; // Estimamos que 30% son renovaciones
          const inscripcionesNuevas = inscripcionesTotal * 0.7; // 70% son nuevas

          const ingresosTotales = cuotasTotal + inscripcionesTotal + merchandisingTotal;

          return {
            name: month.name,
            cuotas: cuotasTotal,
            inscripciones: inscripcionesNuevas,
            renovaciones: renovacionTotal,
            merchandising: merchandisingTotal,
            total: ingresosTotales
          };
        })
      );

      setChartData(monthlyData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ingresos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Ingresos Mensuales
          </CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Cargando datos...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px -4px hsl(var(--foreground) / 0.1)'
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: { [key: string]: string } = {
                      total: 'Total',
                      cuotas: 'Cuotas',
                      inscripciones: 'Inscripciones',
                      renovaciones: 'Renovaciones',
                      merchandising: 'Merchandising'
                    };
                    return [`$${value.toLocaleString()}`, labels[name] || name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="cuotas"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="inscripciones"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="renovaciones"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="merchandising"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-muted-foreground">Cuotas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-muted-foreground">Inscripciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span className="text-muted-foreground">Renovaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-muted-foreground">Merchandising</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};