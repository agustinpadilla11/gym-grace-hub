import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CreditCard, Search, TrendingUp, FileSpreadsheet, Upload, Plus, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Sample data for the table
const sampleCuotas = [
  {
    id: 1,
    alumna: "Ana García",
    grupo: "Escuela",
    monto: "$25.000",
    medio: "Transferencia",
    fechaPago: "30/6/2024",
    vencimiento: "30/7/2024",
    estado: "Vencida"
  },
  {
    id: 2,
    alumna: "Sofía López",
    grupo: "Jardín",
    monto: "$20.000",
    medio: "Efectivo",
    fechaPago: "14/6/2024",
    vencimiento: "14/7/2024",
    estado: "Vencida"
  }
];

// Sample data for the chart
const chartData = [
  { grupo: "Jardín", ingresos: 120000 },
  { grupo: "Escuela", ingresos: 150000 },
  { grupo: "Competencia", ingresos: 180000 }
];

const chartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
};

interface FormData {
  alumna: string;
  grupo: string;
  monto: string;
  medio: string;
  fecha: string;
  vencimiento?: string;
}

export const Cuotas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cuotas, setCuotas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    alumna: "",
    grupo: "jardin",
    monto: "",
    medio: "transferencia",
    fecha: "",
    vencimiento: ""
  });

  useEffect(() => {
    fetchCuotas();
  }, []);

  const fetchCuotas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cuotas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCuotas(data || []);
    } catch (error) {
      console.error('Error fetching cuotas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuotas",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      alumna: "",
      grupo: "jardin",
      monto: "",
      medio: "transferencia",
      fecha: "",
      vencimiento: ""
    });
  };

  const handleSubmit = async () => {
    if (!formData.alumna || !formData.monto || !formData.fecha) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado",
          variant: "destructive",
        });
        return;
      }

      // Calcular fecha de vencimiento (1 mes después de la fecha de pago)
      const fechaPago = new Date(formData.fecha);
      const fechaVencimiento = new Date(fechaPago);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

      const { error } = await supabase
        .from('cuotas')
        .insert({
          user_id: user.id,
          alumna: formData.alumna,
          grupo: formData.grupo,
          monto: parseFloat(formData.monto),
          medio: formData.medio,
          fecha_pago: formData.fecha,
          vencimiento: fechaVencimiento.toISOString().split('T')[0],
          estado: 'pagado'
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "La cuota se ha cargado con éxito",
      });

      clearForm();
      setModalOpen(false);
      await fetchCuotas(); // Recargar la tabla
    } catch (error) {
      console.error('Error saving cuota:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la cuota",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCuotas = cuotas.filter(cuota =>
    cuota.alumna.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    if (cuotas.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay cuotas para exportar",
        variant: "destructive",
      });
      return;
    }

    // Preparar los datos para el Excel
    const excelData = cuotas.map((cuota, index) => ({
      'N°': index + 1,
      'Alumna': cuota.alumna,
      'Grupo': cuota.grupo,
      'Monto': cuota.monto,
      'Medio de Pago': cuota.medio,
      'Fecha de Pago': cuota.fecha_pago,
      'Vencimiento': cuota.vencimiento,
      'Estado': cuota.estado,
      'Fecha de Registro': new Date(cuota.created_at).toLocaleDateString()
    }));

    // Crear el workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 5 },   // N°
      { wch: 20 },  // Alumna
      { wch: 12 },  // Grupo
      { wch: 12 },  // Monto
      { wch: 15 },  // Medio de Pago
      { wch: 15 },  // Fecha de Pago
      { wch: 15 },  // Vencimiento
      { wch: 10 },  // Estado
      { wch: 18 }   // Fecha de Registro
    ];
    ws['!cols'] = colWidths;

    // Añadir la hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Cuotas");

    // Generar el archivo y descargarlo
    const fileName = `cuotas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "¡Éxito!",
      description: `Se exportaron ${cuotas.length} registros de cuotas`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado",
          variant: "destructive",
        });
        return;
      }

      // Leer el archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Procesar los datos y filtrar filas vacías
      const validCuotas = [];
      for (const row of jsonData as any[]) {
        // Verificar que al menos tenga alumna, grupo y monto
        if (row['Alumna'] && row['Grupo'] && row['Monto']) {
          // Calcular fecha de vencimiento si no está presente
          let vencimiento = row['Vencimiento'];
          if (row['Fecha de Pago'] && !vencimiento) {
            const fechaPago = new Date(row['Fecha de Pago']);
            const fechaVencimiento = new Date(fechaPago);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            vencimiento = fechaVencimiento.toISOString().split('T')[0];
          }

          validCuotas.push({
            user_id: user.id,
            alumna: row['Alumna'],
            grupo: row['Grupo'].toLowerCase(),
            monto: parseFloat(row['Monto'].toString().replace(/[^\d.-]/g, '')),
            medio: row['Medio de Pago'] || 'transferencia',
            fecha_pago: row['Fecha de Pago'] || new Date().toISOString().split('T')[0],
            vencimiento: vencimiento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estado: row['Estado'] || 'pagado'
          });
        }
      }

      if (validCuotas.length === 0) {
        toast({
          title: "Sin datos válidos",
          description: "No se encontraron filas con datos válidos en el archivo",
          variant: "destructive",
        });
        return;
      }

      // Insertar en la base de datos
      const { error } = await supabase
        .from('cuotas')
        .insert(validCuotas);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: `Se cargaron ${validCuotas.length} cuotas correctamente`,
      });

      // Recargar la tabla
      await fetchCuotas();

    } catch (error) {
      console.error('Error uploading Excel:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar el archivo Excel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {/* Header with title and action button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cuotas</h1>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Cobrar Cuota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Cobrar Nueva Cuota
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alumna">Alumna <span className="text-red-500">*</span></Label>
                <Input
                  id="alumna"
                  value={formData.alumna}
                  onChange={(e) => handleInputChange("alumna", e.target.value)}
                  placeholder="Escribe el nombre de la alumna..."
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo <span className="text-red-500">*</span></Label>
                <Select value={formData.grupo} onValueChange={(value) => handleInputChange("grupo", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jardin">Jardín</SelectItem>
                    <SelectItem value="escuela">Escuela</SelectItem>
                    <SelectItem value="competencia">Competencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto <span className="text-red-500">*</span></Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => handleInputChange("monto", e.target.value)}
                  placeholder="Monto de la cuota"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medio">Medio de Pago <span className="text-red-500">*</span></Label>
                <Select value={formData.medio} onValueChange={(value) => handleInputChange("medio", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha <span className="text-red-500">*</span></Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Procesando..." : "Registrar Pago"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    clearForm();
                    setModalOpen(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Excel upload */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nombre de alumna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white relative cursor-pointer"
          onClick={() => document.getElementById('excel-upload')?.click()}
          disabled={isLoading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isLoading ? "Cargando..." : "Cargar Excel"}
        </Button>
        <input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumna</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Medio</TableHead>
                <TableHead>Fecha Pago</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCuotas.map((cuota) => (
                <TableRow key={cuota.id}>
                  <TableCell className="font-medium">{cuota.alumna}</TableCell>
                  <TableCell>{cuota.grupo}</TableCell>
                  <TableCell>${cuota.monto}</TableCell>
                  <TableCell>{cuota.medio}</TableCell>
                  <TableCell>{cuota.fecha_pago}</TableCell>
                  <TableCell>{cuota.vencimiento}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${cuota.estado === 'pagado' ? 'text-green-600' : 'text-red-600'}`}>
                      {cuota.estado}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
};