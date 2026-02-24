import { StatsCards } from "@/components/dashboard/StatsCards";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard Principal
        </h1>
        <p className="text-muted-foreground mt-2">
          Resumen general del gimnasio Corpo Libero
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel />
        <RevenueChart />
      </div>
    </div>
  );
};