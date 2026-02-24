import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Eye, Download, Search, Calendar, MapPin, Users } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TournamentsTableProps {
  tournaments: Tournament[];
  onViewDetails: (tournament: Tournament) => void;
  onExport: (tournament: Tournament) => void;
  onExportAll: () => void;
}

export const TournamentsTable = ({ tournaments, onViewDetails, onExport, onExportAll }: TournamentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.category.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      'juvenil': 'bg-blue-50 text-blue-700 border-blue-200',
      'infantil': 'bg-green-50 text-green-700 border-green-200',
      'pre-infantil': 'bg-purple-50 text-purple-700 border-purple-200',
      'nivel-1': 'bg-orange-50 text-orange-700 border-orange-200',
      'nivel-2': 'bg-red-50 text-red-700 border-red-200',
      'nivel-3': 'bg-pink-50 text-pink-700 border-pink-200'
    };

    return (
      <Badge variant="outline" className={variants[category] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {category}
      </Badge>
    );
  };

  const getParticipantsStatus = (tournament: Tournament) => {
    const total = tournament.participants.length;
    const paid = tournament.participants.filter(p => p.payment.status === 'paid').length;
    const partial = tournament.participants.filter(p => p.payment.status === 'partial').length;
    const pending = tournament.participants.filter(p => p.payment.status === 'pending').length;

    return { total, paid, partial, pending };
  };

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Historial de Torneos</h2>
          <div className="flex items-center gap-4">
            {tournaments.length > 0 && (
              <Button
                variant="outline"
                onClick={onExportAll}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Todo
              </Button>
            )}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar torneos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay torneos</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron torneos con esos criterios." : "Crea tu primer torneo para comenzar."}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Torneo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Lugar</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Estado Pagos</TableHead>
                  <TableHead className="w-32">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTournaments.map((tournament) => {
                  const status = getParticipantsStatus(tournament);
                  return (
                    <TableRow key={tournament.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tournament.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Creado: {format(new Date(tournament.createdAt), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(tournament.date), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {tournament.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tournament.category.map((cat, index) => (
                            <span key={index}>{getCategoryBadge(cat)}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{status.total}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {status.paid > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              {status.paid} pagados
                            </Badge>
                          )}
                          {status.partial > 0 && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                              {status.partial} parciales
                            </Badge>
                          )}
                          {status.pending > 0 && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                              {status.pending} pendientes
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(tournament)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {tournament.participants.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onExport(tournament)}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};