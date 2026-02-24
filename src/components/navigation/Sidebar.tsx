import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UserPlus, 
  CreditCard, 
  Users, 
  Trophy, 
  ArrowLeftRight, 
  ShoppingBag,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";

interface SidebarProps {
  username: string;
  onLogout: () => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Inscripciones",
    href: "/inscripciones",
    icon: UserPlus
  },
  {
    title: "Cuotas",
    href: "/cuotas",
    icon: CreditCard
  },
  {
    title: "Alumnos",
    href: "/alumnos",
    icon: Users
  },
  {
    title: "Torneos",
    href: "/torneos",
    icon: Trophy
  },
  {
    title: "Pases",
    href: "/pases",
    icon: ArrowLeftRight
  },
  {
    title: "Merchandising",
    href: "/merchandising",
    icon: ShoppingBag
  }
];

export const Sidebar = ({ username, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Corpo Libero</h2>
                <p className="text-sm text-purple-200">Gestión Gimnasio</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-white/10 text-white"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                "hover:bg-white/10 text-white",
                isActive 
                  ? "bg-purple-800/60 text-white shadow-lg" 
                  : "text-purple-100",
                isCollapsed && "justify-center px-2"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4">
        {!isCollapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{username}</p>
            <p className="text-xs text-purple-200">Administrador</p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className={cn(
            "bg-purple-700 border-purple-600 text-white hover:bg-purple-600 hover:text-white",
            isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
};