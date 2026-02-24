export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cuotas: {
        Row: {
          alumna: string
          created_at: string
          estado: string | null
          fecha_pago: string | null
          grupo: string
          id: string
          medio: string
          monto: number
          user_id: string
          vencimiento: string | null
        }
        Insert: {
          alumna: string
          created_at?: string
          estado?: string | null
          fecha_pago?: string | null
          grupo: string
          id?: string
          medio: string
          monto: number
          user_id: string
          vencimiento?: string | null
        }
        Update: {
          alumna?: string
          created_at?: string
          estado?: string | null
          fecha_pago?: string | null
          grupo?: string
          id?: string
          medio?: string
          monto?: number
          user_id?: string
          vencimiento?: string | null
        }
        Relationships: []
      }
      merchandising_orders: {
        Row: {
          alerta_enviada: boolean | null
          alumna: string
          created_at: string
          entregado: boolean | null
          fecha: string
          id: string
          medio: string
          monto: number
          observacion: string | null
          observacion_pago: string | null
          pago_completo: boolean | null
          producto: string
          talle: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alerta_enviada?: boolean | null
          alumna: string
          created_at?: string
          entregado?: boolean | null
          fecha: string
          id?: string
          medio: string
          monto: number
          observacion?: string | null
          observacion_pago?: string | null
          pago_completo?: boolean | null
          producto: string
          talle: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alerta_enviada?: boolean | null
          alumna?: string
          created_at?: string
          entregado?: boolean | null
          fecha?: string
          id?: string
          medio?: string
          monto?: number
          observacion?: string | null
          observacion_pago?: string | null
          pago_completo?: boolean | null
          producto?: string
          talle?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pases: {
        Row: {
          created_at: string
          fecha: string
          id: string
          medio: string
          monto: number
          student_id: string | null
          student_name: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          fecha: string
          id?: string
          medio: string
          monto: number
          student_id?: string | null
          student_name: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          fecha?: string
          id?: string
          medio?: string
          monto?: number
          student_id?: string | null
          student_name?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pases_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          concept: string
          created_at: string
          date: string
          id: string
          payment_method: string
          status: string | null
          student_id: string
          user_id: string
        }
        Insert: {
          amount: number
          concept: string
          created_at?: string
          date: string
          id?: string
          payment_method: string
          status?: string | null
          student_id: string
          user_id: string
        }
        Update: {
          amount?: number
          concept?: string
          created_at?: string
          date?: string
          id?: string
          payment_method?: string
          status?: string | null
          student_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          federation_amount: number | null
          federation_payment_date: string | null
          federation_payment_method: string | null
          federation_status: string | null
          full_name: string
          id: string
          level: string | null
          medical_certificate_expiry_date: string | null
          medical_certificate_file: string | null
          medical_certificate_status: string | null
          phone: string | null
          photo: string | null
          school: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          federation_amount?: number | null
          federation_payment_date?: string | null
          federation_payment_method?: string | null
          federation_status?: string | null
          full_name: string
          id?: string
          level?: string | null
          medical_certificate_expiry_date?: string | null
          medical_certificate_file?: string | null
          medical_certificate_status?: string | null
          phone?: string | null
          photo?: string | null
          school?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          federation_amount?: number | null
          federation_payment_date?: string | null
          federation_payment_method?: string | null
          federation_status?: string | null
          full_name?: string
          id?: string
          level?: string | null
          medical_certificate_expiry_date?: string | null
          medical_certificate_file?: string | null
          medical_certificate_status?: string | null
          phone?: string | null
          photo?: string | null
          school?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          level: string
          observation: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          student_id: string | null
          student_name: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          level: string
          observation?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          student_id?: string | null
          student_name: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          level?: string
          observation?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          student_id?: string | null
          student_name?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          category: string[]
          created_at: string
          date: string
          id: string
          location: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string[]
          created_at?: string
          date: string
          id?: string
          location: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string[]
          created_at?: string
          date?: string
          id?: string
          location?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
