import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentAutocomplete } from "@/components/students/StudentAutocomplete";
import { Calendar, UserPlus, RotateCcw, Check, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Student } from "@/types/student";

interface RenewalData {
  studentName: string;
  amount: string;
  date: string;
  paymentMethod: string;
}

interface NewStudentData {
  fullName: string;
  amount: string;
  date: string;
  paymentMethod: string;
  school?: string;
  level?: string;
}

interface AnnualManagementModalProps {
  onSuccess: () => void;
}

export const AnnualManagementModal = ({ onSuccess }: AnnualManagementModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  
  // Para alumnas existentes
  const [renewalData, setRenewalData] = useState<RenewalData>({
    studentName: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: ""
  });

  // Para nuevas alumnas
  const [newStudentData, setNewStudentData] = useState<NewStudentData>({
    fullName: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "",
    school: "",
    level: ""
  });

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  useEffect(() => {
    if (selectedStudent) {
      setRenewalData({
        studentName: selectedStudent.fullName,
        amount: selectedStudent.federation.amount?.toString() || "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: selectedStudent.federation.paymentMethod || "transferencia"
      });
      setIsApproved(false);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('full_name');

      if (error) throw error;

      const transformedStudents: Student[] = data.map(student => ({
        id: student.id,
        fullName: student.full_name,
        school: student.school || '',
        birthDate: student.birth_date || '',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        level: student.level || '',
        photo: student.photo,
        medicalCertificate: {
          status: student.medical_certificate_status as 'active' | 'expired' | 'pending',
          expiryDate: student.medical_certificate_expiry_date || undefined,
          file: student.medical_certificate_file || undefined
        },
        federation: {
          status: student.federation_status as 'active' | 'inactive' | 'pending',
          paymentDate: student.federation_payment_date || undefined,
          amount: student.federation_amount || undefined,
          paymentMethod: student.federation_payment_method as 'transferencia' | 'efectivo' | undefined
        },
        paymentHistory: []
      }));

      setStudents(transformedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las alumnas",
        variant: "destructive",
      });
    }
  };

  const handleRenewalInputChange = (field: keyof RenewalData, value: string) => {
    setRenewalData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewStudentInputChange = (field: keyof NewStudentData, value: string) => {
    setNewStudentData(prev => ({ ...prev, [field]: value }));
  };

  const handleExistingStudentRenewal = async () => {
    if (!selectedStudent || !isApproved) {
      toast({
        title: "Error",
        description: "Debes seleccionar una alumna y aprobar los datos",
        variant: "destructive",
      });
      return;
    }

    if (!renewalData.amount || !renewalData.date || !renewalData.paymentMethod) {
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
      if (!user) throw new Error("Usuario no autenticado");

      // Crear el registro de renovación en la tabla pases
      const { error: passError } = await supabase
        .from('pases')
        .insert({
          user_id: user.id,
          student_id: selectedStudent.id,
          student_name: renewalData.studentName,
          fecha: renewalData.date,
          monto: parseFloat(renewalData.amount),
          year: new Date().getFullYear(),
          medio: renewalData.paymentMethod
        });

      if (passError) throw passError;

      // Actualizar el estado de federación del estudiante
      const { error: studentError } = await supabase
        .from('students')
        .update({
          federation_status: 'active',
          federation_payment_date: renewalData.date,
          federation_amount: parseFloat(renewalData.amount),
          federation_payment_method: renewalData.paymentMethod
        })
        .eq('id', selectedStudent.id);

      if (studentError) throw studentError;

      toast({
        title: "¡Renovación exitosa!",
        description: `La inscripción anual de ${renewalData.studentName} ha sido renovada`,
      });

      resetForm();
      setOpen(false);
      onSuccess();

    } catch (error) {
      console.error('Error renewing registration:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al renovar la inscripción",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewStudentRegistration = async () => {
    if (!isApproved) {
      toast({
        title: "Error",
        description: "Debes aprobar los datos antes de continuar",
        variant: "destructive",
      });
      return;
    }

    if (!newStudentData.fullName || !newStudentData.amount || !newStudentData.date || !newStudentData.paymentMethod) {
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
      if (!user) throw new Error("Usuario no autenticado");

      // Crear la nueva alumna
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          full_name: newStudentData.fullName,
          school: newStudentData.school || null,
          level: newStudentData.level || null,
          federation_status: 'active',
          federation_payment_date: newStudentData.date,
          federation_amount: parseFloat(newStudentData.amount),
          federation_payment_method: newStudentData.paymentMethod,
          medical_certificate_status: 'pending'
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Crear el registro en pases
      const { error: passError } = await supabase
        .from('pases')
        .insert({
          user_id: user.id,
          student_id: newStudent.id,
          student_name: newStudentData.fullName,
          fecha: newStudentData.date,
          monto: parseFloat(newStudentData.amount),
          year: new Date().getFullYear(),
          medio: newStudentData.paymentMethod
        });

      if (passError) throw passError;

      toast({
        title: "¡Inscripción exitosa!",
        description: `${newStudentData.fullName} ha sido inscrita y registrada en el sistema`,
      });

      resetForm();
      setOpen(false);
      onSuccess();

    } catch (error) {
      console.error('Error creating new student registration:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al crear la inscripción",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setRenewalData({
      studentName: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: ""
    });
    setNewStudentData({
      fullName: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      school: "",
      level: ""
    });
    setIsApproved(false);
    setActiveTab("existing");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Gestionar Inscripción Anual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Gestionar Inscripción Anual {new Date().getFullYear()}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Renueva inscripciones de alumnas existentes o crea nuevas inscripciones
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Renovar Existente
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Nueva Inscripción
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 mt-6">
            {/* Contenido para renovar alumna existente */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  Buscar Alumna para Renovar <span className="text-red-500">*</span>
                </Label>
              </div>
              
              <div className="relative">
                <StudentAutocomplete
                  students={students}
                  value={studentSearch}
                  onValueChange={setStudentSearch}
                  onStudentSelect={setSelectedStudent}
                  placeholder="Escribe el nombre de la alumna..."
                />
                {!selectedStudent && studentSearch && (
                  <p className="text-sm text-amber-600 mt-1">
                    Selecciona una alumna de la lista para continuar
                  </p>
                )}
              </div>
            </div>

            {selectedStudent && (
              <div className="space-y-6">
                {/* Información del estudiante existente */}
                <Card className="border-slate-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-lg font-semibold text-primary">
                          {selectedStudent.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground break-words">{selectedStudent.fullName}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {selectedStudent.school || "Sin escuela registrada"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">NIVEL</Label>
                        <p className="text-sm font-medium">{selectedStudent.level || "No especificado"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">ESTADO FEDERACIÓN</Label>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedStudent.federation.status === 'active' ? 'bg-green-500' : 
                            selectedStudent.federation.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <p className="text-sm font-medium capitalize">
                            {selectedStudent.federation.status === 'active' ? 'Activo' : 
                             selectedStudent.federation.status === 'inactive' ? 'Inactivo' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-muted-foreground">ÚLTIMO PAGO</Label>
                        <p className="text-sm font-medium">
                          {selectedStudent.federation.paymentDate || "Sin registros"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formulario de renovación */}
                <Card className="border-green-200 bg-green-50/30">
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4">
                      Renovación {new Date().getFullYear()}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-800">
                          Fecha de Renovación <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={renewalData.date}
                          onChange={(e) => handleRenewalInputChange("date", e.target.value)}
                          className="bg-white border-green-300 focus:border-green-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-800">
                          Monto a Pagar <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-medium">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={renewalData.amount}
                            onChange={(e) => handleRenewalInputChange("amount", e.target.value)}
                            className="pl-8 bg-white border-green-300 focus:border-green-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-800">
                          Método de Pago <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={renewalData.paymentMethod} 
                          onValueChange={(value) => handleRenewalInputChange("paymentMethod", value)}
                        >
                          <SelectTrigger className="bg-white border-green-300 focus:border-green-500">
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transferencia">💳 Transferencia</SelectItem>
                            <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/80 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="renewal-approval"
                          checked={isApproved}
                          onCheckedChange={(checked) => setIsApproved(checked as boolean)}
                          className="border-green-500 data-[state=checked]:bg-green-600 mt-0.5"
                        />
                        <Label htmlFor="renewal-approval" className="text-sm font-medium text-green-800 cursor-pointer flex-1">
                          <Check className="w-4 h-4 inline mr-2" />
                          Confirmo que los datos son correctos y autorizo la renovación
                        </Label>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                      <Button
                        onClick={handleExistingStudentRenewal}
                        disabled={isLoading || !isApproved}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        {isLoading ? "Renovando..." : "Renovar Inscripción"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        disabled={isLoading}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Limpiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-4 mt-6">
            {/* Contenido para nueva inscripción */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">
                  Nueva Inscripción Anual {new Date().getFullYear()}
                </h4>
                <p className="text-sm text-blue-700 mb-6">
                  Crea una nueva inscripción para una alumna que no está registrada en el sistema
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={newStudentData.fullName}
                      onChange={(e) => handleNewStudentInputChange("fullName", e.target.value)}
                      className="bg-white border-blue-300 focus:border-blue-500"
                      placeholder="Nombre y apellido de la alumna"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">Escuela</Label>
                    <Input
                      type="text"
                      value={newStudentData.school}
                      onChange={(e) => handleNewStudentInputChange("school", e.target.value)}
                      className="bg-white border-blue-300 focus:border-blue-500"
                      placeholder="Escuela de la alumna (opcional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">Nivel</Label>
                    <Input
                      type="text"
                      value={newStudentData.level}
                      onChange={(e) => handleNewStudentInputChange("level", e.target.value)}
                      className="bg-white border-blue-300 focus:border-blue-500"
                      placeholder="Nivel de la alumna (opcional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">
                      Fecha de Inscripción <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={newStudentData.date}
                      onChange={(e) => handleNewStudentInputChange("date", e.target.value)}
                      className="bg-white border-blue-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">
                      Monto a Pagar <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newStudentData.amount}
                        onChange={(e) => handleNewStudentInputChange("amount", e.target.value)}
                        className="pl-8 bg-white border-blue-300 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-800">
                      Método de Pago <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={newStudentData.paymentMethod} 
                      onValueChange={(value) => handleNewStudentInputChange("paymentMethod", value)}
                    >
                      <SelectTrigger className="bg-white border-blue-300 focus:border-blue-500">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transferencia">💳 Transferencia</SelectItem>
                        <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/80 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="new-approval"
                      checked={isApproved}
                      onCheckedChange={(checked) => setIsApproved(checked as boolean)}
                      className="border-blue-500 data-[state=checked]:bg-blue-600 mt-0.5"
                    />
                    <Label htmlFor="new-approval" className="text-sm font-medium text-blue-800 cursor-pointer flex-1">
                      <Check className="w-4 h-4 inline mr-2" />
                      Confirmo que los datos son correctos y autorizo la nueva inscripción
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  <Button
                    onClick={handleNewStudentRegistration}
                    disabled={isLoading || !isApproved}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isLoading ? "Creando..." : "Crear Inscripción"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};