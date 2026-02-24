import { useState } from "react";
import { PassModal } from "@/components/students/PassModal";
import { PassesTable } from "@/components/pases/PassesTable";

export const Pases = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePassCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pases</h1>
        </div>
        <PassModal onPassCreated={handlePassCreated} />
      </div>

      <PassesTable refreshTrigger={refreshTrigger} />
    </div>
  );
};