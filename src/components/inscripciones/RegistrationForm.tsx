import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Calendar, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RegistrationFormData {
  fullName: string;
  birthDate: string;
  dni: string;
  address: string;
  phone: string;
  contactName: string;
  email: string;
  medicalCertificateDate: string;
  school: string;
  paymentDate: string;
  paymentMethod: string;
  amount: string;
  medicalCertificateFile: File | null;
  photoFile: File | null;
}

interface RegistrationFormProps {
  onRegistrationSuccess: () => void;
}

export const RegistrationForm = ({ onRegistrationSuccess }: RegistrationFormProps) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    birthDate: "",
    dni: "",
    address: "",
    phone: "",
    contactName: "",
    email: "",
    medicalCertificateDate: "",
    school: "",
    paymentDate: "",
    paymentMethod: "",
    amount: "",
    medicalCertificateFile: null,
    photoFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      fullName: "",
      birthDate: "",
      dni: "",
      address: "",
      phone: "",
      contactName: "",
      email: "",
      medicalCertificateDate: "",
      school: "",
      paymentDate: "",
      paymentMethod: "",
      amount: "",
      medicalCertificateFile: null,
      photoFile: null,
    });
  };

  const handleFileChange = (field: "medicalCertificateFile" | "photoFile", file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

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

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.birthDate || !formData.dni) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
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
          description: "Debes estar autenticado para registrar una alumna",
          variant: "destructive",
        });
        return;
      }

      // Upload files if they exist
      let medicalCertificateUrl: string | null = null;
      let photoUrl: string | null = null;

      if (formData.medicalCertificateFile) {
        const timestamp = Date.now();
        const fileName = `${user.id}_${timestamp}_${formData.medicalCertificateFile.name}`;
        medicalCertificateUrl = await uploadFile(
          formData.medicalCertificateFile,
          'medical-certificates',
          fileName
        );
      }

      if (formData.photoFile) {
        const timestamp = Date.now();
        const fileName = `${user.id}_${timestamp}_${formData.photoFile.name}`;
        photoUrl = await uploadFile(
          formData.photoFile,
          'student-photos',
          fileName
        );
      }

      const { error } = await supabase
        .from("students")
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          birth_date: formData.birthDate,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          school: formData.school || formData.contactName,
          level: null,
          medical_certificate_expiry_date: formData.medicalCertificateDate || null,
          medical_certificate_file: medicalCertificateUrl,
          photo: photoUrl,
          federation_payment_date: formData.paymentDate || null,
          federation_amount: formData.amount ? parseFloat(formData.amount) : null,
          federation_payment_method: formData.paymentMethod || null,
          medical_certificate_status: formData.medicalCertificateDate ? "active" : "pending",
          federation_status: formData.paymentDate ? "active" : "inactive",
        });

      if (error) throw error;

      toast({
        title: "¡Registro exitoso!",
        description: "La alumna ha sido registrada correctamente",
      });

      clearForm();
      onRegistrationSuccess();
    } catch (error) {
      console.error("Error registering student:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al registrar la alumna",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-foreground">Nueva Inscripción</h2>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-medium text-foreground">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Nombre completo de la alumna"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-sm font-medium text-foreground">
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="fecha"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni" className="text-sm font-medium text-foreground">
              DNI <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dni"
              value={formData.dni}
              onChange={(e) => handleInputChange("dni", e.target.value)}
              placeholder="Número de DNI"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-sm font-medium text-foreground">
              Dirección
            </Label>
            <Input
              id="direccion"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Dirección completa"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-medium text-foreground">
              Teléfono de Contacto
            </Label>
            <Input
              id="telefono"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Número de teléfono"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contacto" className="text-sm font-medium text-foreground">
              Nombre de Contacto
            </Label>
            <Input
              id="contacto"
              value={formData.contactName}
              onChange={(e) => handleInputChange("contactName", e.target.value)}
              placeholder="Nombre del padre/madre/tutor"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaCertificado" className="text-sm font-medium text-foreground">
              Fecha Certificado Médico
            </Label>
            <div className="relative">
              <Input
                id="fechaCertificado"
                type="date"
                value={formData.medicalCertificateDate}
                onChange={(e) => handleInputChange("medicalCertificateDate", e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grupo" className="text-sm font-medium text-foreground">
              Grupo
            </Label>
            <Select value={formData.school} onValueChange={(value) => handleInputChange("school", value)}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Jardín" />
              </SelectTrigger>
               <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="jardin">Jardín</SelectItem>
                <SelectItem value="escuela">Escuela</SelectItem>
                <SelectItem value="competencia">Competencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Subir Certificado Médico
            </Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => document.getElementById('medical-certificate-input')?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-1">
                {formData.medicalCertificateFile ? formData.medicalCertificateFile.name : "Arrastra el archivo aquí o haz clic para seleccionar"}
              </p>
              <p className="text-gray-400 text-sm">PDF, JPG, JPEG, PNG</p>
            </div>
            <input
              id="medical-certificate-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange("medicalCertificateFile", e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Subir Foto de la Alumna
            </Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => document.getElementById('photo-input')?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-1">
                {formData.photoFile ? formData.photoFile.name : "Arrastra la foto aquí o haz clic para seleccionar"}
              </p>
              <p className="text-gray-400 text-sm">JPG, PNG</p>
            </div>
            <input
              id="photo-input"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => handleFileChange("photoFile", e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaPago" className="text-sm font-medium text-foreground">
              Fecha de Pago
            </Label>
            <div className="relative">
              <Input
                id="fechaPago"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medioPago" className="text-sm font-medium text-foreground">
              Medio de Pago
            </Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Transferencia" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto" className="text-sm font-medium text-foreground">
              Monto
            </Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
            >
              {isLoading ? "Registrando..." : "Registrar Alumna"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};