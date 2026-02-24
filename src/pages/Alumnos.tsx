import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, MapPin, Eye, Edit, Search, Plus } from "lucide-react";
import { Student, StudentFormData } from "@/types/student";
import { StudentEditModal } from "@/components/students/StudentEditModal";
import { StudentHistoryModal } from "@/components/students/StudentHistoryModal";
import { StudentAutocomplete } from "@/components/students/StudentAutocomplete";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Alumnos = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [displayedStudent, setDisplayedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedStudents: Student[] = (data || []).map(student => ({
        id: student.id,
        fullName: student.full_name,
        school: student.school || "",
        birthDate: student.birth_date || "",
        phone: student.phone || "",
        email: student.email || "",
        address: student.address || "",
        medicalCertificate: {
          status: (student.medical_certificate_status as "pending" | "active" | "expired") || "pending",
          expiryDate: student.medical_certificate_expiry_date || "",
          file: student.medical_certificate_file || ""
        },
        federation: {
          status: (student.federation_status as "active" | "inactive" | "pending") || "inactive",
          paymentDate: student.federation_payment_date || "",
          amount: student.federation_amount || 0,
          paymentMethod: (student.federation_payment_method as "transferencia" | "efectivo") || "transferencia"
        },
        level: student.level || "inicial",
        photo: student.photo || "",
        paymentHistory: []
      }));

      setStudents(mappedStudents);
      if (mappedStudents.length > 0 && !displayedStudent) {
        setDisplayedStudent(mappedStudents[0]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    }
  };

  const currentStudent = displayedStudent || (students.length > 0 ? students[0] : null);

  const handleAddNew = () => {
    setSelectedStudent(null);
    setIsEditMode(false);
    setIsEditModalOpen(true);
  };

  const handleEdit = () => {
    setSelectedStudent(currentStudent);
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const handleViewHistory = () => {
    setSelectedStudent(currentStudent);
    setIsHistoryModalOpen(true);
  };

  const handleStudentSearch = (student: Student | null) => {
    setDisplayedStudent(student);
  };

  const handleSaveStudent = async (data: StudentFormData) => {
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

      if (isEditMode && selectedStudent) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            full_name: data.fullName,
            school: data.school,
            birth_date: data.birthDate || null,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            medical_certificate_status: data.medicalCertificate.status,
            medical_certificate_expiry_date: data.medicalCertificate.expiryDate || null,
            medical_certificate_file: data.medicalCertificate.file || null,
            federation_status: data.federation.status,
            federation_payment_date: data.federation.paymentDate || null,
            federation_amount: data.federation.amount || null,
            federation_payment_method: data.federation.paymentMethod,
            level: data.level,
            photo: data.photo || null,
          })
          .eq('id', selectedStudent.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "¡Éxito!",
          description: "Cambios guardados con éxito",
        });

        // Update local state
        const updatedStudent: Student = {
          ...selectedStudent,
          ...data,
          id: selectedStudent.id,
          paymentHistory: selectedStudent.paymentHistory
        };
        
        setStudents(prev => prev.map(s => 
          s.id === selectedStudent.id ? updatedStudent : s
        ));
        
        if (displayedStudent?.id === selectedStudent.id) {
          setDisplayedStudent(updatedStudent);
        }
      } else {
        // Add new student
        const { data: newStudentData, error } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            full_name: data.fullName,
            school: data.school,
            birth_date: data.birthDate || null,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            medical_certificate_status: data.medicalCertificate.status,
            medical_certificate_expiry_date: data.medicalCertificate.expiryDate || null,
            medical_certificate_file: data.medicalCertificate.file || null,
            federation_status: data.federation.status,
            federation_payment_date: data.federation.paymentDate || null,
            federation_amount: data.federation.amount || null,
            federation_payment_method: data.federation.paymentMethod,
            level: data.level,
            photo: data.photo || null,
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "¡Éxito!",
          description: "Nueva alumna agregada correctamente",
        });

        // Add to local state
        const newStudent: Student = {
          ...data,
          id: newStudentData.id,
          paymentHistory: []
        };
        
        setStudents(prev => [...prev, newStudent]);
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Alumnos</h1>
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Alumna
          </Button>
        </div>
        
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <div className="pl-10">
              <StudentAutocomplete
                students={students}
                value={searchValue}
                onValueChange={setSearchValue}
                onStudentSelect={handleStudentSearch}
                placeholder="Buscar alumna por nombre..."
              />
            </div>
          </div>
        </div>
      </div>

      {currentStudent ? (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20 bg-pink-500 text-white">
                <AvatarFallback className="bg-pink-500 text-white text-lg font-semibold">
                  {currentStudent.fullName ? currentStudent.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentStudent.fullName}</h2>
                  <p className="text-muted-foreground">{currentStudent.school}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Nacimiento: {currentStudent.birthDate ? new Date(currentStudent.birthDate).toLocaleDateString() : 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{currentStudent.phone || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{currentStudent.email || 'No especificado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{currentStudent.address || 'No especificado'}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Certificado Médico:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        currentStudent.medicalCertificate.status === 'active' 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : currentStudent.medicalCertificate.status === 'expired'
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }>
                        {currentStudent.medicalCertificate.status === 'active' ? 'Activo' : 
                         currentStudent.medicalCertificate.status === 'expired' ? 'Vencido' : 'Pendiente'}
                      </Badge>
                      {currentStudent.medicalCertificate.file && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = currentStudent.medicalCertificate.file!;
                            link.download = `certificado_medico_${currentStudent.fullName}.pdf`;
                            link.click();
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      )}
                    </div>
                  </div>
                  {currentStudent.medicalCertificate.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vence:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(currentStudent.medicalCertificate.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Federación:</span>
                    <Badge variant="outline" className={
                      currentStudent.federation.status === 'active' 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : currentStudent.federation.status === 'inactive'
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }>
                      {currentStudent.federation.status === 'active' ? 'Activa' : 
                       currentStudent.federation.status === 'inactive' ? 'Inactiva' : 'Pendiente'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nivel:</span>
                    <span className="text-sm text-muted-foreground capitalize">{currentStudent.level}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleViewHistory} variant="default" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                  <Button onClick={handleEdit} variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-4">No hay estudiantes registrados</p>
              <p className="text-sm">Agrega una nueva alumna para comenzar</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <StudentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
        onSave={handleSaveStudent}
        isEditMode={isEditMode}
        allStudents={students}
        isLoading={isLoading}
      />

      <StudentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
};

export default Alumnos;