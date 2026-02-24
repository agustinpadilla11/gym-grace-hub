import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StudentAutocomplete } from "@/components/students/StudentAutocomplete";
import { ParticipantFormData } from "@/types/tournament";
import { Student } from "@/types/student";

interface ParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ParticipantFormData) => void;
  students: Student[];
  tournamentName: string;
}

export const ParticipantModal = ({ open, onOpenChange, onSubmit, students, tournamentName }: ParticipantModalProps) => {
  const [formData, setFormData] = useState<ParticipantFormData>({
    studentName: "",
    level: "",
    paymentDate: "",
    paymentAmount: 0,
    paymentMethod: "transferencia",
    paymentStatus: "paid",
    observation: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentName && formData.level) {
      onSubmit(formData);
      // Reset form
      setFormData({
        studentName: "",
        level: "",
        paymentDate: "",
        paymentAmount: 0,
        paymentMethod: "transferencia",
        paymentStatus: "paid",
        observation: ""
      });
      setSelectedDate(undefined);
      setSelectedStudent(null);
      onOpenChange(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        paymentDate: format(date, "yyyy-MM-dd")
      }));
    }
  };

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    // No auto-fill level, allow manual input
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscribir Gimnasta - {tournamentName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Gimnasta</Label>
            <StudentAutocomplete
              students={students}
              value={formData.studentName}
              onValueChange={(value) => setFormData(prev => ({ ...prev, studentName: value }))}
              onStudentSelect={handleStudentSelect}
              placeholder="Buscar y seleccionar gimnasta..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivel</Label>
            <Input
              id="level"
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
              placeholder="Ej: Inicial, Intermedio, Avanzado"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Pago</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                value={formData.paymentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value: 'transferencia' | 'efectivo') => setFormData(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado del Pago</Label>
              <Select 
                value={formData.paymentStatus} 
                onValueChange={(value: 'paid' | 'partial' | 'pending') => setFormData(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observación</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
              placeholder="Observaciones sobre el pago (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Inscribir Gimnasta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};