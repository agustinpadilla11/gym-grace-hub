import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student, StudentFormData } from "@/types/student";
import { StudentAutocomplete } from "./StudentAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  onSave: (data: StudentFormData) => Promise<void>;
  isEditMode: boolean;
  allStudents: Student[];
  isLoading?: boolean;
}

export const StudentEditModal = ({ isOpen, onClose, student, onSave, isEditMode, allStudents, isLoading = false }: StudentEditModalProps) => {
  const [selectedStudentFromAutocomplete, setSelectedStudentFromAutocomplete] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: "",
    school: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    medicalCertificate: {
      status: "pending",
      expiryDate: "",
      file: ""
    },
    federation: {
      status: "pending",
      paymentDate: "",
      amount: 0,
      paymentMethod: "transferencia"
    },
    level: "inicial",
    emergencyPhone: "",
    obraSocial: "",
    photo: ""
  });

  useEffect(() => {
    if (student && isEditMode) {
      setFormData({
        fullName: student.fullName,
        school: student.school,
        birthDate: student.birthDate,
        phone: student.phone,
        email: student.email,
        address: student.address,
        medicalCertificate: {
          status: student.medicalCertificate.status,
          expiryDate: student.medicalCertificate.expiryDate || "",
          file: student.medicalCertificate.file || ""
        },
        federation: {
          status: student.federation.status,
          paymentDate: student.federation.paymentDate || "",
          amount: student.federation.amount || 0,
          paymentMethod: student.federation.paymentMethod || "transferencia"
        },
        level: student.level,
        emergencyPhone: student.emergencyPhone || "",
        obraSocial: student.obraSocial || "",
        photo: student.photo || ""
      });
    } else {
      // Reset form for add mode
      setFormData({
        fullName: "",
        school: "",
        birthDate: "",
        phone: "",
        email: "",
        address: "",
        medicalCertificate: {
          status: "pending",
          expiryDate: "",
          file: ""
        },
        federation: {
          status: "pending",
          paymentDate: "",
          amount: 0,
          paymentMethod: "transferencia"
        },
        level: "inicial",
        emergencyPhone: "",
        obraSocial: "",
        photo: ""
      });
    }
  }, [student, isEditMode, isOpen]);

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading file to ${bucket}:`, error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  const handleFileChange = async (field: 'photo' | 'medicalCertificate.file', file: File | null) => {
    if (!file) return;

    try {
      const bucket = field === 'photo' ? 'student-photos' : 'medical-certificates';
      const timestamp = Date.now();
      const fileName = `${formData.fullName.replace(/\s+/g, '_')}_${timestamp}_${file.name}`;
      
      const publicUrl = await uploadFile(file, bucket, fileName);
      
      if (publicUrl) {
        if (field === 'photo') {
          handleInputChange('photo', publicUrl);
        } else {
          handleInputChange('medicalCertificate.file', publicUrl);
        }
        toast({
          title: "Archivo cargado",
          description: "El archivo se ha subido correctamente.",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('federation.')) {
      const federationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        federation: {
          ...prev.federation,
          [federationField]: value
        }
      }));
    } else if (field.startsWith('medicalCertificate.')) {
      const medicalField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        medicalCertificate: {
          ...prev.medicalCertificate,
          [medicalField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleStudentSelect = (selectedStudent: Student | null) => {
    if (selectedStudent && !isEditMode) {
      // Auto-fill form with selected student data
      setFormData({
        fullName: selectedStudent.fullName,
        school: selectedStudent.school,
        birthDate: selectedStudent.birthDate,
        phone: selectedStudent.phone,
        email: selectedStudent.email,
        address: selectedStudent.address,
        medicalCertificate: {
          status: selectedStudent.medicalCertificate.status,
          expiryDate: selectedStudent.medicalCertificate.expiryDate || "",
          file: selectedStudent.medicalCertificate.file || ""
        },
        federation: {
          status: selectedStudent.federation.status,
          paymentDate: selectedStudent.federation.paymentDate || "",
          amount: selectedStudent.federation.amount || 0,
          paymentMethod: selectedStudent.federation.paymentMethod || "transferencia"
        },
        level: selectedStudent.level,
        emergencyPhone: selectedStudent.emergencyPhone || "",
        obraSocial: selectedStudent.obraSocial || "",
        photo: selectedStudent.photo || ""
      });
    }
    setSelectedStudentFromAutocomplete(selectedStudent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Alumna" : "Agregar Nueva Alumna"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              {!isEditMode ? (
                <StudentAutocomplete
                  students={allStudents}
                  value={formData.fullName}
                  onValueChange={(value) => handleInputChange('fullName', value)}
                  onStudentSelect={handleStudentSelect}
                  placeholder="Buscar o escribir nombre completo..."
                />
              ) : (
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Ingrese el nombre completo"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Foto de la Alumna</Label>
              <div className="flex items-center gap-4">
                {formData.photo && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                    <img src={formData.photo} alt="Vista previa" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleInputChange('photo', '')}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                    Formato JPG, PNG. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="261-4567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Número de Emergencia</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="Número de contacto de emergencia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obraSocial">Obra Social</Label>
              <Input
                id="obraSocial"
                value={formData.obraSocial}
                onChange={(e) => handleInputChange('obraSocial', e.target.value)}
                placeholder="Nombre de la obra social"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Av. San Martín 123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">Escuela</Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                placeholder="Nombre de la escuela"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel</Label>
              <Input
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                placeholder="inicial, intermedio, avanzado..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Certificado Médico</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicalStatus">Estado del Certificado</Label>
                <Select
                  value={formData.medicalCertificate.status}
                  onValueChange={(value) => handleInputChange('medicalCertificate.status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="expired">Vencido</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalExpiryDate">Fecha de Vencimiento</Label>
                <Input
                  id="medicalExpiryDate"
                  type="date"
                  value={formData.medicalCertificate.expiryDate}
                  onChange={(e) => handleInputChange('medicalCertificate.expiryDate', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="medicalFile">Archivo del Certificado Médico</Label>
                <div className="space-y-2">
                  <Input
                    id="medicalFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('medicalCertificate.file', e.target.files?.[0] || null)}
                  />
                  {formData.medicalCertificate.file && (
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (formData.medicalCertificate.file) {
                            const link = document.createElement('a');
                            link.href = formData.medicalCertificate.file;
                            link.download = `certificado_medico_${formData.fullName}.pdf`;
                            link.click();
                          }
                        }}
                      >
                        Ver Certificado
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('medicalCertificate.file', '')}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Federación</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="federationStatus">Estado de Federación</Label>
                <Select
                  value={formData.federation.status}
                  onValueChange={(value) => handleInputChange('federation.status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="federationPaymentDate">Fecha de Pago/Actualización</Label>
                <Input
                  id="federationPaymentDate"
                  type="date"
                  value={formData.federation.paymentDate}
                  onChange={(e) => handleInputChange('federation.paymentDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="federationAmount">Monto</Label>
                <Input
                  id="federationAmount"
                  type="number"
                  value={formData.federation.amount}
                  onChange={(e) => handleInputChange('federation.amount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="federationPaymentMethod">Medio de Pago</Label>
                <Select
                  value={formData.federation.paymentMethod}
                  onValueChange={(value) => handleInputChange('federation.paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Medio de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditMode ? "Guardando..." : "Agregando...") : (isEditMode ? "Guardar Cambios" : "Agregar Alumna")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};