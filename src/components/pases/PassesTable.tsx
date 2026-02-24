import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Pass {
  id: string;
  student_name: string;
  fecha: string;
  monto: number;
  medio: string;
  year: number;
  created_at: string;
}

interface PassesTableProps {
  refreshTrigger?: number;
}

export const PassesTable = ({ refreshTrigger }: PassesTableProps) => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading passes:', error);
        toast({
          title: "Error",
          description: "Hubo un error al cargar los pases.",
          variant: "destructive"
        });
        return;
      }

      setPasses(data || []);
    } catch (error) {
      console.error('Error loading passes:', error);
      toast({
        title: "Error",
        description: "Hubo un error al cargar los pases.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodColors: { [key: string]: string } = {
      'transferencia': 'bg-blue-100 text-blue-800 border-blue-200',
      'efectivo': 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <Badge variant="outline" className={methodColors[method] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {method === 'transferencia' ? 'Transferencia' : 'Efectivo'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Pases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando pases...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (passes.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Pases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay pases registrados aún</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Historial de Pases ({passes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumna</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Medio de Pago</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Fecha de Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passes.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-medium">{pass.student_name}</TableCell>
                  <TableCell>{formatDate(pass.fecha)}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {formatCurrency(pass.monto)}
                  </TableCell>
                  <TableCell>{getPaymentMethodBadge(pass.medio)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                      {pass.year}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(pass.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};