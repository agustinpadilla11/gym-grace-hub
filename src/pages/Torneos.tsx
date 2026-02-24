import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Calendar, MapPin, Download } from "lucide-react";
import { TournamentModal } from "@/components/tournaments/TournamentModal";
import { ParticipantModal } from "@/components/tournaments/ParticipantModal";
import { TournamentDetailModal } from "@/components/tournaments/TournamentDetailModal";
import { TournamentsTable } from "@/components/tournaments/TournamentsTable";
import { Tournament, TournamentFormData, ParticipantFormData } from "@/types/tournament";
import { Student } from "@/types/student";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export const Torneos = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    fetchTournaments();
    fetchStudents();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;

      const tournamentsWithParticipants = await Promise.all(
        (tournamentsData || []).map(async (tournament) => {
          const { data: participantsData, error: participantsError } = await supabase
            .from('tournament_participants')
            .select('*')
            .eq('tournament_id', tournament.id);

          if (participantsError) throw participantsError;

          const participants = (participantsData || []).map(p => ({
            id: p.id,
            studentId: p.student_id || p.id,
            studentName: p.student_name,
            level: p.level,
            payment: {
              id: p.id,
              date: p.payment_date || new Date().toISOString().split('T')[0],
              amount: p.payment_amount || 0,
              method: p.payment_method as 'transferencia' | 'efectivo',
              status: p.payment_status as 'paid' | 'partial' | 'pending',
              observation: p.observation || '',
              dueDate: p.due_date
            }
          }));

          return {
            id: tournament.id,
            name: tournament.name,
            date: tournament.date,
            location: tournament.location,
            category: tournament.category,
            participants,
            createdAt: tournament.created_at
          };
        })
      );

      setTournaments(tournamentsWithParticipants);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los torneos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');

      if (error) throw error;

      const formattedStudents: Student[] = (studentsData || []).map(student => ({
        id: student.id,
        fullName: student.full_name,
        school: student.school || '',
        birthDate: student.birth_date || '',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        medicalCertificate: { 
          status: student.medical_certificate_status === 'active' ? 'active' : 'pending',
          expiryDate: student.medical_certificate_expiry_date || undefined,
          file: student.medical_certificate_file || undefined
        },
        federation: { 
          status: student.federation_status === 'active' ? 'active' : 'inactive',
          paymentDate: student.federation_payment_date || undefined,
          amount: student.federation_amount || undefined,
          paymentMethod: student.federation_payment_method as 'transferencia' | 'efectivo' || undefined
        },
        level: student.level || '',
        paymentHistory: [],
        photo: student.photo || undefined
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateTournament = async (data: TournamentFormData) => {
    try {
      const { data: newTournament, error } = await supabase
        .from('tournaments')
        .insert({
          name: data.name,
          date: data.date,
          location: data.location,
          category: data.category,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const tournamentWithParticipants: Tournament = {
        id: newTournament.id,
        name: newTournament.name,
        date: newTournament.date,
        location: newTournament.location,
        category: newTournament.category,
        participants: [],
        createdAt: newTournament.created_at
      };

      setTournaments(prev => [tournamentWithParticipants, ...prev]);
      
      toast({
        title: "Torneo creado con éxito",
        description: `El torneo "${data.name}" ha sido creado exitosamente.`
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el torneo",
        variant: "destructive"
      });
    }
  };

  const handleAddParticipant = async (data: ParticipantFormData) => {
    if (!selectedTournament) return;

    try {
      const { data: newParticipant, error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: selectedTournament.id,
          student_name: data.studentName,
          level: data.level,
          payment_date: data.paymentDate,
          payment_amount: data.paymentAmount,
          payment_method: data.paymentMethod,
          payment_status: data.paymentStatus,
          observation: data.observation,
          due_date: data.paymentStatus === 'partial' ? 
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const formattedParticipant = {
        id: newParticipant.id,
        studentId: newParticipant.student_id || newParticipant.id,
        studentName: newParticipant.student_name,
        level: newParticipant.level,
        payment: {
          id: newParticipant.id,
          date: newParticipant.payment_date,
          amount: newParticipant.payment_amount,
          method: newParticipant.payment_method as 'transferencia' | 'efectivo',
          status: newParticipant.payment_status as 'paid' | 'partial' | 'pending',
          observation: newParticipant.observation || '',
          dueDate: newParticipant.due_date
        }
      };

      setTournaments(prev => prev.map(tournament => 
        tournament.id === selectedTournament.id 
          ? { ...tournament, participants: [...tournament.participants, formattedParticipant] }
          : tournament
      ));

      // Update selected tournament for modal
      setSelectedTournament(prev => prev ? {
        ...prev,
        participants: [...prev.participants, formattedParticipant]
      } : null);

      toast({
        title: "Gimnasta inscripta con éxito",
        description: `${data.studentName} ha sido inscripta en el torneo.`
      });

    } catch (error) {
      console.error('Error adding participant:', error);
      toast({
        title: "Error",
        description: "No se pudo inscribir a la gimnasta",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowDetailModal(true);
  };

  const handleExportToExcel = (tournament: Tournament) => {
    const worksheetData = tournament.participants.map(participant => ({
      'Gimnasta': participant.studentName,
      'Nivel': participant.level,
      'Fecha de Pago': participant.payment.date,
      'Monto': participant.payment.amount,
      'Método': participant.payment.method,
      'Estado': participant.payment.status === 'paid' ? 'Pagado' : 
               participant.payment.status === 'partial' ? 'Parcial' : 'Pendiente',
      'Observación': participant.payment.observation
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes');

    // Aplicar estilos simples
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddr]) continue;
      worksheet[cellAddr].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      };
    }

    XLSX.writeFile(workbook, `${tournament.name.replace(/\s+/g, '_')}_participantes.xlsx`);
    
    toast({
      title: "Archivo exportado",
      description: `Los datos del torneo han sido exportados a Excel.`
    });
  };

  const handleExportAllTournaments = () => {
    if (tournaments.length === 0) return;

    const allParticipantsData = tournaments.flatMap(tournament => 
      tournament.participants.map(participant => ({
        'Torneo': tournament.name,
        'Fecha Torneo': new Date(tournament.date).toLocaleDateString('es-ES'),
        'Lugar': tournament.location,
        'Categorías': tournament.category.join(', '),
        'Gimnasta': participant.studentName,
        'Nivel': participant.level,
        'Fecha de Pago': participant.payment.date,
        'Monto': participant.payment.amount,
        'Método': participant.payment.method,
        'Estado': participant.payment.status === 'paid' ? 'Pagado' : 
                  participant.payment.status === 'partial' ? 'Parcial' : 'Pendiente',
        'Observación': participant.payment.observation
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(allParticipantsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Todos los Torneos');

    // Aplicar estilos simples
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddr]) continue;
      worksheet[cellAddr].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
      };
    }

    XLSX.writeFile(workbook, `Historial_Torneos_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Archivo exportado",
      description: `El historial completo de torneos ha sido exportado a Excel.`
    });
  };

  const handleOpenParticipantModal = () => {
    setShowDetailModal(false);
    setShowParticipantModal(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Cargando torneos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Torneos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona torneos y participantes
          </p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setShowTournamentModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Torneo
        </Button>
      </div>

      {/* Current Tournament Card */}
      {tournaments.length > 0 && (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{tournaments[0].name}</h2>
              <Trophy className="w-8 h-8 text-orange-500" />
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(tournaments[0].date).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{tournaments[0].location}</span>
              </div>
              <div className="text-muted-foreground">
                Categorías: 
                <div className="flex flex-wrap gap-1 mt-1">
                  {tournaments[0].category.map((cat, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Gimnastas Inscriptas ({tournaments[0].participants.length}):</h3>
              {tournaments[0].participants.length > 0 ? (
                <div className="space-y-2">
                  {tournaments[0].participants.slice(0, 3).map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{participant.studentName}</span>
                        <span className="text-muted-foreground ml-2">({participant.level})</span>
                      </div>
                      <Badge variant="outline" className={
                        participant.payment.status === 'paid' ? "bg-green-50 text-green-700 border-green-200" :
                        participant.payment.status === 'partial' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }>
                        {participant.payment.status === 'paid' ? 'Pagado' : 
                         participant.payment.status === 'partial' ? 'Parcial' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))}
                  {tournaments[0].participants.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Y {tournaments[0].participants.length - 3} más...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay gimnastas inscriptas aún.</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => handleViewDetails(tournaments[0])}
              >
                Ver Detalles
              </Button>
              {tournaments[0].participants.length > 0 && (
                <Button 
                  variant="outline" 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white border-green-500"
                  onClick={() => handleExportToExcel(tournaments[0])}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tournaments History Table */}
      <TournamentsTable 
        tournaments={tournaments}
        onViewDetails={handleViewDetails}
        onExport={handleExportToExcel}
        onExportAll={handleExportAllTournaments}
      />

      {/* Modals */}
      <TournamentModal
        open={showTournamentModal}
        onOpenChange={setShowTournamentModal}
        onSubmit={handleCreateTournament}
      />

      <ParticipantModal
        open={showParticipantModal}
        onOpenChange={setShowParticipantModal}
        onSubmit={handleAddParticipant}
        students={students}
        tournamentName={selectedTournament?.name || ""}
      />

      <TournamentDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        tournament={selectedTournament}
        onAddParticipant={handleOpenParticipantModal}
        onExport={() => selectedTournament && handleExportToExcel(selectedTournament)}
      />
    </div>
  );
};