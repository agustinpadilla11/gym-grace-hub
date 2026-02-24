import { useState } from "react";
import { RegistrationForm } from "@/components/inscripciones/RegistrationForm";
import { RegistrationsTable } from "@/components/inscripciones/RegistrationsTable";
import { AnnualManagementModal } from "@/components/inscripciones/AnnualManagementModal";

export const Inscripciones = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRegistrationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Inscripciones
        </h1>
        <AnnualManagementModal onSuccess={handleRegistrationSuccess} />
      </div>

      <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />
      <RegistrationsTable refreshTrigger={refreshTrigger} />
    </div>
  );
};