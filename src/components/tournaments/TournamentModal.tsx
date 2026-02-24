import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TournamentFormData } from "@/types/tournament";

interface TournamentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TournamentFormData) => void;
}

export const TournamentModal = ({ open, onOpenChange, onSubmit }: TournamentModalProps) => {
  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    date: "",
    location: "",
    category: []
  });
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.date && formData.location && formData.category.length > 0) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        date: "",
        location: "",
        category: []
      });
      setCategoryInput("");
      setSelectedDate(undefined);
      onOpenChange(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryInput(value);
    // Split by commas and clean up the categories
    const categories = value.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
    setFormData(prev => ({ ...prev, category: categories }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: format(date, "yyyy-MM-dd")
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Torneo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Torneo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Regional Cuyano"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
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
            <Label htmlFor="location">Lugar</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ej: San Juan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categorías</Label>
            <Input
              id="category"
              value={categoryInput}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="Ej: Juvenil, Infantil, Nivel 1 (separar con comas)"
              required
            />
            {formData.category.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.category.map((cat, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear Torneo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};