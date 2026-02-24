import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface PassModalProps {
  onPassCreated?: () => void;
}

export const PassModal = ({ onPassCreated }: PassModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    gimnasioTraspaso: '',
    fecha: '',
    monto: '',
    medioPago: ''
  });
  
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !formData.gimnasioTraspaso || !formData.fecha || !formData.monto || !formData.medioPago) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes estar autenticado para registrar un pase",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('pases')
        .insert({
          user_id: user.id,
          student_name: selectedStudent,
          fecha: formData.fecha,
          monto: parseFloat(formData.monto),
          medio: formData.medioPago,
          year: new Date(formData.fecha).getFullYear()
        });

      if (error) {
        console.error('Error creating pass:', error);
        toast({
          title: "Error",
          description: "Hubo un error al registrar el pase. Intenta nuevamente.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Pase creado con éxito",
        description: "El pase ha sido registrado exitosamente."
      });
      
      // Reset form
      setSelectedStudent("");
      setFormData({
        gimnasioTraspaso: '',
        fecha: '',
        monto: '',
        medioPago: ''
      });
      setOpen(false);
      
      // Call callback to refresh the passes list
      if (onPassCreated) {
        onPassCreated();
      }
      
    } catch (error) {
      console.error('Error creating pass:', error);
      toast({
        title: "Error",
        description: "Hubo un error al registrar el pase. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Registrar Nuevo Pase
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Nombre Completo</Label>
            <Input 
              id="student"
              list="students-list"
              placeholder="Escribe el nombre completo de la alumna..."
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            />
            <datalist id="students-list">
              <option value="Ana García" />
              <option value="Sofía López" />
              <option value="María Rodríguez" />
              <option value="Carmen Silva" />
              <option value="Lucía Martín" />
            </datalist>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gym">Gimnasio de Traspaso</Label>
            <Input 
              id="gym" 
              placeholder="Nombre del gimnasio destino" 
              value={formData.gimnasioTraspaso}
              onChange={(e) => setFormData({...formData, gimnasioTraspaso: e.target.value})}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input 
              id="date" 
              type="date" 
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="0.00" 
              step="0.01" 
              min="0" 
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">Medio de Pago</Label>
            <Select 
              value={formData.medioPago} 
              onValueChange={(value) => setFormData({...formData, medioPago: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Pase"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};