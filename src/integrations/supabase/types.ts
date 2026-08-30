export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          balance: number
          created_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          account_number: string
          balance?: number
          created_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          account_number?: string
          balance?: number
          created_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action: string
          admin_email: string
          created_at: string
          details: Json
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_email: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          created_at?: string
          details?: Json
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      card_requests: {
        Row: {
          account_id: string | null
          admin_note: string | null
          amount: number
          card_type: string
          created_at: string
          delivery_type: string
          gift_card_image_urls: string[]
          gift_card_type: string | null
          id: string
          payment_method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          admin_note?: string | null
          amount?: number
          card_type: string
          created_at?: string
          delivery_type: string
          gift_card_image_urls?: string[]
          gift_card_type?: string | null
          id?: string
          payment_method: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          admin_note?: string | null
          amount?: number
          card_type?: string
          created_at?: string
          delivery_type?: string
          gift_card_image_urls?: string[]
          gift_card_type?: string | null
          id?: string
          payment_method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      card_secrets: {
        Row: {
          card_id: string
          created_at: string
          pin: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          pin: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          pin?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_secrets_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string | null
          card_type: string
          created_at: string
          daily_limit: number
          expiry: string
          fee_paid: number
          holder_name: string
          id: string
          masked_number: string
          status: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          card_type?: string
          created_at?: string
          daily_limit?: number
          expiry: string
          fee_paid?: number
          holder_name: string
          id?: string
          masked_number: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          card_type?: string
          created_at?: string
          daily_limit?: number
          expiry?: string
          fee_paid?: number
          holder_name?: string
          id?: string
          masked_number?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_settings: {
        Row: {
          created_at: string
          description: string
          field_key: string
          field_label: string
          field_value: string
          id: string
          method: string
          notice: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          field_key: string
          field_label: string
          field_value?: string
          id?: string
          method: string
          notice?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          field_key?: string
          field_label?: string
          field_value?: string
          id?: string
          method?: string
          notice?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          event_key: string | null
          id: string
          link: string | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_key?: string | null
          id?: string
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_key?: string | null
          id?: string
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          notify_email: boolean
          notify_push: boolean
          phone: string | null
          tier: string
          transfers_locked: boolean
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id: string
          notify_email?: boolean
          notify_push?: boolean
          phone?: string | null
          tier?: string
          transfers_locked?: boolean
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          notify_email?: boolean
          notify_push?: boolean
          phone?: string | null
          tier?: string
          transfers_locked?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      recipients: {
        Row: {
          account_number: string
          bank: string
          created_at: string
          id: string
          name: string
          routing_number: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          bank: string
          created_at?: string
          id?: string
          name: string
          routing_number?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          bank?: string
          created_at?: string
          id?: string
          name?: string
          routing_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_urls: string[]
          read_by_admin: boolean
          read_by_user: boolean
          sender: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_urls?: string[]
          read_by_admin?: boolean
          read_by_user?: boolean
          sender?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_urls?: string[]
          read_by_admin?: boolean
          read_by_user?: boolean
          sender?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          category: string
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tier_upgrade_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          gift_card_image_urls: string[]
          gift_card_type: string | null
          id: string
          payment_method: string
          requested_tier: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          gift_card_image_urls?: string[]
          gift_card_type?: string | null
          id?: string
          payment_method: string
          requested_tier: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          gift_card_image_urls?: string[]
          gift_card_type?: string | null
          id?: string
          payment_method?: string
          requested_tier?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          direction: string
          id: string
          recipient_account: string | null
          recipient_bank: string | null
          recipient_name: string | null
          reference: string
          routing_number: string | null
          status: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          direction: string
          id?: string
          recipient_account?: string | null
          recipient_bank?: string | null
          recipient_name?: string | null
          reference: string
          routing_number?: string | null
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          direction?: string
          id?: string
          recipient_account?: string | null
          recipient_bank?: string | null
          recipient_name?: string | null
          reference?: string
          routing_number?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
