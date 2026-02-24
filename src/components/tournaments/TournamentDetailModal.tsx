import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Download, Plus } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TournamentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament | null;
  onAddParticipant: () => void;
  onExport: () => void;
}

export const TournamentDetailModal = ({ 
  open, 
  onOpenChange, 
  tournament, 
  onAddParticipant,
  onExport 
}: TournamentDetailModalProps) => {
  if (!tournament) return null;

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pagado</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Parcial</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pendiente</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tournament.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tournament Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{format(new Date(tournament.date), "PPP", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{tournament.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{tournament.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Gimnastas Inscriptas ({tournament.participants.length})</h3>
              <Button onClick={onAddParticipant} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Gimnasta
              </Button>
            </div>

            {tournament.participants.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay gimnastas inscriptas aún</p>
                  <Button onClick={onAddParticipant} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Inscribir Primera Gimnasta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tournament.participants.map((participant) => (
                  <Card key={participant.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{participant.studentName}</h4>
                            <Badge variant="secondary">{participant.level}</Badge>
                            {getPaymentStatusBadge(participant.payment.status)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span>Pago: ${participant.payment.amount}</span>
                              <span>Método: {participant.payment.method}</span>
                              {participant.payment.date && (
                                <span>Fecha: {format(new Date(participant.payment.date), "dd/MM/yyyy")}</span>
                              )}
                            </div>
                            {participant.payment.observation && (
                              <p className="text-xs">Obs: {participant.payment.observation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cerrar
            </Button>
            {tournament.participants.length > 0 && (
              <Button onClick={onExport} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};