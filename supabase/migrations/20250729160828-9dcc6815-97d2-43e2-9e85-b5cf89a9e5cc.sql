-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  school TEXT,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  address TEXT,
  medical_certificate_status TEXT DEFAULT 'pending',
  medical_certificate_expiry_date DATE,
  medical_certificate_file TEXT,
  federation_status TEXT DEFAULT 'inactive',
  federation_payment_date DATE,
  federation_amount DECIMAL(10,2),
  federation_payment_method TEXT,
  level TEXT,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for students
CREATE POLICY "Users can manage their own students" 
ON public.students 
FOR ALL 
USING (auth.uid() = user_id);

-- Create payment_records table
CREATE TABLE public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  concept TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payment_records
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_records
CREATE POLICY "Users can manage their own payment records" 
ON public.payment_records 
FOR ALL 
USING (auth.uid() = user_id);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  category TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tournaments
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments
CREATE POLICY "Users can manage their own tournaments" 
ON public.tournaments 
FOR ALL 
USING (auth.uid() = user_id);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  level TEXT NOT NULL,
  payment_date DATE,
  payment_amount DECIMAL(10,2),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  observation TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tournament_participants
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for tournament_participants
CREATE POLICY "Users can manage their own tournament participants" 
ON public.tournament_participants 
FOR ALL 
USING (auth.uid() = user_id);

-- Create merchandising_orders table
CREATE TABLE public.merchandising_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto TEXT NOT NULL,
  talle TEXT NOT NULL,
  alumna TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  medio TEXT NOT NULL,
  observacion_pago TEXT DEFAULT 'completo',
  observacion TEXT,
  fecha DATE NOT NULL,
  entregado BOOLEAN DEFAULT false,
  pago_completo BOOLEAN DEFAULT true,
  alerta_enviada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on merchandising_orders
ALTER TABLE public.merchandising_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for merchandising_orders
CREATE POLICY "Users can manage their own merchandising orders" 
ON public.merchandising_orders 
FOR ALL 
USING (auth.uid() = user_id);

-- Create cuotas table (monthly fees)
CREATE TABLE public.cuotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alumna TEXT NOT NULL,
  grupo TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  medio TEXT NOT NULL,
  fecha_pago DATE,
  vencimiento DATE,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cuotas
ALTER TABLE public.cuotas ENABLE ROW LEVEL SECURITY;

-- Create policies for cuotas
CREATE POLICY "Users can manage their own cuotas" 
ON public.cuotas 
FOR ALL 
USING (auth.uid() = user_id);

-- Create pases table (annual renewals)
CREATE TABLE public.pases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  medio TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pases
ALTER TABLE public.pases ENABLE ROW LEVEL SECURITY;

-- Create policies for pases
CREATE POLICY "Users can manage their own pases" 
ON public.pases 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchandising_orders_updated_at
  BEFORE UPDATE ON public.merchandising_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();