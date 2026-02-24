import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  school: string;
  level: string;
  medical_certificate_status: string;
  federation_status: string;
  federation_amount: number;
  federation_payment_method: string;
  created_at: string;
}

interface RegistrationsTableProps {
  refreshTrigger: number;
}

export const RegistrationsTable = ({ refreshTrigger }: RegistrationsTableProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      expired: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      expired: "Vencido",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Cargando inscripciones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Users className="w-5 h-5 text-blue-500" />
          Inscripciones Registradas ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay inscripciones registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha Nacimiento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Cert. Médico</TableHead>
                  <TableHead>Federación</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{formatDate(student.birth_date)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{student.phone || "N/A"}</div>
                        <div className="text-gray-500">{student.email || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.school || "N/A"}</TableCell>
                    <TableCell>{student.level || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(student.medical_certificate_status)}</TableCell>
                    <TableCell>{getStatusBadge(student.federation_status)}</TableCell>
                    <TableCell>
                      {student.federation_amount ? 
                        `$${student.federation_amount.toLocaleString("es-ES", { minimumFractionDigits: 2 })}` : 
                        "N/A"
                      }
                    </TableCell>
                    <TableCell>{formatDate(student.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};