import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Plus, Package, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { MerchandisingOrder } from "@/types/merchandising";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Merchandising = () => {
  const [orders, setOrders] = useState<MerchandisingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    producto: '',
    talle: '',
    alumna: '',
    monto: '',
    montoPagado: '', // Nuevo campo
    medio: '',
    observacionPago: '',
    observacion: '',
    fecha: ''
  });

  // Cargar pedidos desde Supabase
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Si hay error de token, redirigir al login
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }
      
      if (!session.session?.user?.id) return;

      const { data, error } = await supabase
        .from('merchandising_orders')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: MerchandisingOrder[] = data.map(order => ({
        id: order.id,
        producto: order.producto,
        talle: order.talle,
        alumna: order.alumna,
        monto: order.monto,
        montoPagado: order.pago_completo ? order.monto : 0,
        medio: order.medio as 'transferencia' | 'efectivo',
        observacionPago: order.observacion_pago as 'completo' | 'parcial',
        observacion: order.observacion || '',
        fecha: order.fecha,
        entregado: order.entregado,
        pagoCompleto: order.pago_completo,
        fechaCreacion: new Date(order.created_at),
        alertaEnviada: order.alerta_enviada
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.producto || !formData.alumna || !formData.monto || !formData.medio || !formData.observacionPago || !formData.fecha) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validar monto pagado si es pago parcial
    if (formData.observacionPago === 'parcial') {
      if (!formData.montoPagado || parseFloat(formData.montoPagado) <= 0) {
        toast({
          title: "Error",
          description: "Debes especificar el monto pagado para pagos parciales",
          variant: "destructive"
        });
        return;
      }
      
      if (parseFloat(formData.montoPagado) >= parseFloat(formData.monto)) {
        toast({
          title: "Error",
          description: "El monto pagado no puede ser mayor o igual al monto total",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Si hay error de token, redirigir al login
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
          variant: "destructive"
        });
        // Limpiar sesión local y redirigir
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }
      
      if (!session.session?.user?.id) {
        throw new Error('No hay sesión activa');
      }

      const { error } = await supabase
        .from('merchandising_orders')
        .insert({
          user_id: session.session.user.id,
          producto: formData.producto,
          talle: formData.talle,
          alumna: formData.alumna,
          monto: parseFloat(formData.monto),
          monto_pagado: formData.observacionPago === 'parcial' ? parseFloat(formData.montoPagado) : parseFloat(formData.monto),
          medio: formData.medio,
          observacion_pago: formData.observacionPago,
          observacion: formData.observacion,
          fecha: formData.fecha,
          entregado: false,
          pago_completo: formData.observacionPago === 'completo',
          alerta_enviada: false
        });

      if (error) throw error;

      // Limpiar formulario
      setFormData({
        producto: '',
        talle: '',
        alumna: '',
        monto: '',
        montoPagado: '',
        medio: '',
        observacionPago: '',
        observacion: '',
        fecha: ''
      });

      // Recargar pedidos
      await fetchOrders();

      toast({
        title: "Pedido creado con éxito",
        description: "El pedido de merchandising ha sido registrado exitosamente",
        variant: "default"
      });

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pedido. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEntregado = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const { error } = await supabase
        .from('merchandising_orders')
        .update({ entregado: !order.entregado })
        .eq('id', id);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === id ? { ...order, entregado: !order.entregado } : order
      ));

      toast({
        title: "Estado actualizado",
        description: `Pedido marcado como ${!order.entregado ? 'entregado' : 'no entregado'}`,
      });
    } catch (error) {
      console.error('Error updating entregado:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const togglePagoCompleto = async (id: string) => {
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      const { error } = await supabase
        .from('merchandising_orders')
        .update({ pago_completo: !order.pagoCompleto })
        .eq('id', id);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === id ? { ...order, pagoCompleto: !order.pagoCompleto } : order
      ));

      toast({
        title: "Estado actualizado",
        description: `Pago marcado como ${!order.pagoCompleto ? 'completo' : 'incompleto'}`,
      });
    } catch (error) {
      console.error('Error updating pago_completo:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pago",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Merchandising</h1>
      </div>

      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            Nuevo Pedido de Merchandising
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Producto *</label>
                <Input 
                  placeholder="Escribe el producto (ej: Malla de competencia, Accesorios...)"
                  value={formData.producto}
                  onChange={(e) => setFormData({...formData, producto: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Talle</label>
                <Input 
                  placeholder="Ej: S, M, L, XL"
                  value={formData.talle}
                  onChange={(e) => setFormData({...formData, talle: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Alumna *</label>
                <Input 
                  placeholder="Escribe el nombre de la alumna..."
                  value={formData.alumna}
                  onChange={(e) => setFormData({...formData, alumna: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Monto Total *</label>
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  required
                />
              </div>

              {/* Nuevo campo para monto pagado en caso de pago parcial */}
              {formData.observacionPago === 'parcial' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Monto Pagado *</label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.montoPagado}
                    onChange={(e) => setFormData({...formData, montoPagado: e.target.value})}
                    required
                  />
                  {formData.monto && formData.montoPagado && (
                    <p className="text-sm text-muted-foreground">
                      Falta: ${(parseFloat(formData.monto) - parseFloat(formData.montoPagado) || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Medio de Pago *</label>
                <Select value={formData.medio} onValueChange={(value) => setFormData({...formData, medio: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar medio de pago..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Estado del Pago *</label>
                <Select value={formData.observacionPago} onValueChange={(value) => setFormData({...formData, observacionPago: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado del pago..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completo">Pago Completo</SelectItem>
                    <SelectItem value="parcial">Pago Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Observación</label>
                <Textarea 
                  placeholder="Observaciones del pedido"
                  value={formData.observacion}
                  onChange={(e) => setFormData({...formData, observacion: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Fecha del pedido *</label>
                <Input 
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Creando...' : 'Crear Pedido'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="w-5 h-5 text-pink-500" />
            Pedidos de Merchandising ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos registrados aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Talle</TableHead>
                    <TableHead>Alumna</TableHead>
                    <TableHead>Monto Total</TableHead>
                    <TableHead>Estado Pago</TableHead>
                    <TableHead>Medio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Entregado</TableHead>
                    <TableHead className="text-center">Pago Completo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.producto}</TableCell>
                      <TableCell>{order.talle || '-'}</TableCell>
                      <TableCell>{order.alumna}</TableCell>
                      <TableCell>${order.monto.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.observacionPago === 'completo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.observacionPago === 'completo' ? 'Completo' : 'Parcial'}
                          </span>
                          {order.observacionPago === 'parcial' && (
                            <div className="text-xs text-muted-foreground">
                              <div>Pagado: ${(order.montoPagado || 0).toFixed(2)}</div>
                              <div className="text-red-600 font-medium">
                                Falta: ${(order.monto - (order.montoPagado || 0)).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{order.medio}</TableCell>
                      <TableCell>{new Date(order.fecha).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={order.entregado}
                          onCheckedChange={() => toggleEntregado(order.id)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={order.pagoCompleto}
                          onCheckedChange={() => togglePagoCompleto(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {order.entregado && order.pagoCompleto ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Completo</span>
                          </div>
                        ) : (
                          <span className="text-xs text-yellow-600 font-medium">Pendiente</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};