import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, UserPlus, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (username: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      onLogin(loginData.username);
      toast({
        title: "Bienvenido/a",
        description: `Ingreso exitoso al sistema Corpo Libero`,
      });
    } else {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.username && signupData.email && signupData.password && signupData.confirmPassword) {
      if (signupData.password === signupData.confirmPassword) {
        toast({
          title: "Usuario creado",
          description: `Usuario ${signupData.username} registrado exitosamente`,
        });
        setSignupData({ username: "", email: "", password: "", confirmPassword: "" });
      } else {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Corpo Libero
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sistema de Gestión de Gimnasia Artística
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Ingresar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                  <Lock className="w-4 h-4 mr-2" />
                  Ingresar al Sistema
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Nombre de Usuario</Label>
                  <Input
                    id="new-username"
                    type="text"
                    placeholder="Elige un nombre de usuario"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Crea una contraseña"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90 transition-opacity">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};