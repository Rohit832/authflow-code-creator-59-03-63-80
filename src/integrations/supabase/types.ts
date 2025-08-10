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
      admin_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_approved: boolean
          is_super_admin: boolean | null
          last_login: string | null
          password_hash: string | null
          permissions: Json | null
          phone_number: string | null
          role: string | null
          role_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_approved?: boolean
          is_super_admin?: boolean | null
          last_login?: string | null
          password_hash?: string | null
          permissions?: Json | null
          phone_number?: string | null
          role?: string | null
          role_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean
          is_super_admin?: boolean | null
          last_login?: string | null
          password_hash?: string | null
          permissions?: Json | null
          phone_number?: string | null
          role?: string | null
          role_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          receiver_id: string | null
          sender_id: string
          sender_type: string
          session_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          receiver_id?: string | null
          sender_id: string
          sender_type: string
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          receiver_id?: string | null
          sender_id?: string
          sender_type?: string
          session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_conversations: {
        Row: {
          admin_id: string | null
          client_id: string
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_conversations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "client_conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          address: string | null
          annual_income_range: string | null
          avatar_url: string | null
          city: string | null
          client_status: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          id: string
          investment_experience: string | null
          investment_goals: string | null
          job_title: string | null
          linkedin_profile: string | null
          notes: string | null
          phone_number: string | null
          postal_code: string | null
          preferred_language: string | null
          referral_source: string | null
          risk_tolerance: string | null
          state_province: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          client_status?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string | null
          job_title?: string | null
          linkedin_profile?: string | null
          notes?: string | null
          phone_number?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          referral_source?: string | null
          risk_tolerance?: string | null
          state_province?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          client_status?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string | null
          job_title?: string | null
          linkedin_profile?: string | null
          notes?: string | null
          phone_number?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          referral_source?: string | null
          risk_tolerance?: string | null
          state_province?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_registrations: {
        Row: {
          access_code: string | null
          address: string | null
          admin_id: string | null
          annual_income_range: string | null
          avatar_url: string | null
          city: string | null
          client_status: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          id: string
          investment_experience: string | null
          investment_goals: string | null
          job_title: string | null
          linkedin_profile: string | null
          mobile_number: string | null
          notes: string | null
          postal_code: string | null
          preferred_language: string | null
          referral_source: string | null
          risk_tolerance: string | null
          state_province: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          address?: string | null
          admin_id?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          client_status?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string | null
          job_title?: string | null
          linkedin_profile?: string | null
          mobile_number?: string | null
          notes?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          referral_source?: string | null
          risk_tolerance?: string | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          address?: string | null
          admin_id?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          client_status?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string | null
          job_title?: string | null
          linkedin_profile?: string | null
          mobile_number?: string | null
          notes?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          referral_source?: string | null
          risk_tolerance?: string | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          annual_income_range: string | null
          avatar_url: string | null
          city: string | null
          client_status: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          id: string
          investment_experience: string | null
          investment_goals: string | null
          job_title: string | null
          last_login: string | null
          linkedin_profile: string | null
          notes: string | null
          password_hash: string
          phone_number: string | null
          postal_code: string | null
          preferred_language: string | null
          referral_source: string | null
          risk_tolerance: string | null
          role: string | null
          state_province: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          client_status?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string | null
          job_title?: string | null
          last_login?: string | null
          linkedin_profile?: string | null
          notes?: string | null
          password_hash: string
          phone_number?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          referral_source?: string | null
          risk_tolerance?: string | null
          role?: string | null
          state_province?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          annual_income_range?: string | null
          avatar_url?: string | null
          city?: string | null
          client_status?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          investment_experience?: string | null
          investment_goals?: string | null
          job_title?: string | null
          last_login?: string | null
          linkedin_profile?: string | null
          notes?: string | null
          password_hash?: string
          phone_number?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          referral_source?: string | null
          risk_tolerance?: string | null
          role?: string | null
          state_province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_schedules: {
        Row: {
          coach_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_schedules_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          experience_years: number | null
          id: string
          is_available: boolean
          name: string
          phone_number: string | null
          profile_image_url: string | null
          specialty_tags: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          id?: string
          is_available?: boolean
          name: string
          phone_number?: string | null
          profile_image_url?: string | null
          specialty_tags?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean
          name?: string
          phone_number?: string | null
          profile_image_url?: string | null
          specialty_tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          admin_id: string | null
          client_id: string
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          type: string
          updated_at: string
          user_type: string | null
        }
        Insert: {
          admin_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          type: string
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          admin_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      credit_requests: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string
          id: string
          reason: string | null
          requested_amount: number
          service_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_amount: number
          service_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          requested_amount?: number
          service_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          amount: number
          created_at: string
          id: string
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_tools: {
        Row: {
          access_type: string | null
          admin_id: string | null
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          price_inr: number
          session_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          admin_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          price_inr: number
          session_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          admin_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          price_inr?: number
          session_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      individual_bookings: {
        Row: {
          booking_date: string
          created_at: string
          id: string
          payment_amount: number
          payment_status: string
          plan_id: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date?: string
          created_at?: string
          id?: string
          payment_amount: number
          payment_status?: string
          plan_id?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          id?: string
          payment_amount?: number
          payment_status?: string
          plan_id?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      individual_payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          id: string
          payment_method: string
          payment_status: string
          service_type: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          id?: string
          payment_method?: string
          payment_status?: string
          service_type?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          payment_method?: string
          payment_status?: string
          service_type?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      individual_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      individual_purchases: {
        Row: {
          amount_paid: number
          can_rebook: boolean | null
          cancellation_date: string | null
          created_at: string
          id: string
          item_id: string
          item_type: string
          payment_method: string | null
          purchase_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          can_rebook?: boolean | null
          cancellation_date?: string | null
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          payment_method?: string | null
          purchase_date?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          can_rebook?: boolean | null
          cancellation_date?: string | null
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          payment_method?: string | null
          purchase_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      individual_sessions: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_active: boolean
          price_inr: number
          session_type: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean
          price_inr: number
          session_type: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean
          price_inr?: number
          session_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      individual_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          password_hash: string | null
          phone_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          password_hash?: string | null
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          password_hash?: string | null
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          client_ip: unknown | null
          company_name: string
          company_optional: string | null
          company_size: string | null
          country: string | null
          created_at: string
          first_name: string
          id: string
          inquiry_type: string | null
          instagram_profile: string | null
          job_title: string | null
          last_name: string
          linkedin_profile: string | null
          message: string | null
          mobile_number: string | null
          phone_number: string | null
          preferred_contact_method: string | null
          status: string
          updated_at: string
          whatsapp_number: string | null
          work_email: string
        }
        Insert: {
          client_ip?: unknown | null
          company_name: string
          company_optional?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          first_name: string
          id?: string
          inquiry_type?: string | null
          instagram_profile?: string | null
          job_title?: string | null
          last_name: string
          linkedin_profile?: string | null
          message?: string | null
          mobile_number?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          status?: string
          updated_at?: string
          whatsapp_number?: string | null
          work_email: string
        }
        Update: {
          client_ip?: unknown | null
          company_name?: string
          company_optional?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          first_name?: string
          id?: string
          inquiry_type?: string | null
          instagram_profile?: string | null
          job_title?: string | null
          last_name?: string
          linkedin_profile?: string | null
          message?: string | null
          mobile_number?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          status?: string
          updated_at?: string
          whatsapp_number?: string | null
          work_email?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          client_conversation_id: string | null
          content: string
          conversation_id: string | null
          conversation_type: string | null
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          read_by: string[] | null
          sender_id: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          client_conversation_id?: string | null
          content: string
          conversation_id?: string | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          read_by?: string[] | null
          sender_id: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          client_conversation_id?: string | null
          content?: string
          conversation_id?: string | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          read_by?: string[] | null
          sender_id?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_client_conversation_id_fkey"
            columns: ["client_conversation_id"]
            isOneToOne: false
            referencedRelation: "client_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          content: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          notification_type: string
          recipient_info: Json | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_name: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          recipient_info?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_name?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          recipient_info?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      one_on_one_sessions: {
        Row: {
          access_type: string | null
          admin_id: string | null
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          price_inr: number
          session_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          admin_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          price_inr: number
          session_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          admin_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          price_inr?: number
          session_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          updated_at: string
          used: boolean
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          updated_at?: string
          used?: boolean
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          updated_at?: string
          used?: boolean
          user_type?: string
        }
        Relationships: []
      }
      service_plans: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          features: string[] | null
          id: string
          plan_type: string
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          plan_type: string
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          features?: string[] | null
          id?: string
          plan_type?: string
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          booking_date: string
          created_at: string
          credits_used: number
          id: string
          session_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date?: string
          created_at?: string
          credits_used?: number
          id?: string
          session_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          credits_used?: number
          id?: string
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          notes: string | null
          purchase_id: string
          session_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          notes?: string | null
          purchase_id: string
          session_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          notes?: string | null
          purchase_id?: string
          session_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_purchases: {
        Row: {
          can_rebook: boolean | null
          cancellation_date: string | null
          created_at: string
          id: string
          purchase_date: string
          session_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_rebook?: boolean | null
          cancellation_date?: string | null
          created_at?: string
          id?: string
          purchase_date?: string
          session_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_rebook?: boolean | null
          cancellation_date?: string | null
          created_at?: string
          id?: string
          purchase_date?: string
          session_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_purchases_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "individual_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_scheduling: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          booking_id: string
          coach_feedback: string | null
          coach_id: string | null
          created_at: string
          id: string
          join_instructions: string | null
          post_session_notes: string | null
          pre_session_notes: string | null
          preferred_date: string | null
          preferred_time: string | null
          preferred_timezone: string | null
          scheduled_date: string | null
          session_feedback: string | null
          session_platform: string | null
          session_rating: number | null
          session_type: string | null
          session_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          booking_id: string
          coach_feedback?: string | null
          coach_id?: string | null
          created_at?: string
          id?: string
          join_instructions?: string | null
          post_session_notes?: string | null
          pre_session_notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          preferred_timezone?: string | null
          scheduled_date?: string | null
          session_feedback?: string | null
          session_platform?: string | null
          session_rating?: number | null
          session_type?: string | null
          session_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          booking_id?: string
          coach_feedback?: string | null
          coach_id?: string | null
          created_at?: string
          id?: string
          join_instructions?: string | null
          post_session_notes?: string | null
          pre_session_notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          preferred_timezone?: string | null
          scheduled_date?: string | null
          session_feedback?: string | null
          session_platform?: string | null
          session_rating?: number | null
          session_type?: string | null
          session_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          admin_id: string | null
          created_at: string
          credits_required: number
          description: string | null
          duration: string
          id: string
          image_url: string | null
          location: string
          max_participants: number | null
          session_date: string
          session_time: string
          session_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          credits_required?: number
          description?: string | null
          duration?: string
          id?: string
          image_url?: string | null
          location: string
          max_participants?: number | null
          session_date: string
          session_time: string
          session_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          credits_required?: number
          description?: string | null
          duration?: string
          id?: string
          image_url?: string | null
          location?: string
          max_participants?: number | null
          session_date?: string
          session_time?: string
          session_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      short_programs: {
        Row: {
          access_type: string | null
          admin_id: string | null
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          price_inr: number
          session_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_type?: string | null
          admin_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          price_inr: number
          session_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_type?: string | null
          admin_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          price_inr?: number
          session_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accessibility_needs: string | null
          created_at: string
          emergency_contact: Json | null
          id: string
          language_preference: string | null
          notification_preferences: Json | null
          preferred_coach_gender: string | null
          preferred_communication_method: string | null
          preferred_session_time: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_needs?: string | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          language_preference?: string | null
          notification_preferences?: Json | null
          preferred_coach_gender?: string | null
          preferred_communication_method?: string | null
          preferred_session_time?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_needs?: string | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          language_preference?: string | null
          notification_preferences?: Json | null
          preferred_coach_gender?: string | null
          preferred_communication_method?: string | null
          preferred_session_time?: string | null
          timezone?: string | null
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
      cleanup_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      debug_auth_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_access_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_otp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_messages_as_read: {
        Args: {
          p_conversation_id: string
          p_user_id: string
          p_user_type: string
        }
        Returns: undefined
      }
      simple_hash_password: {
        Args: { password: string }
        Returns: string
      }
      transfer_pending_messages_to_conversation: {
        Args: { p_booking_id: string; p_conversation_id: string }
        Returns: undefined
      }
      verify_password: {
        Args: { password: string; hash: string }
        Returns: boolean
      }
    }
    Enums: {
      registration_status: "pending" | "approved" | "rejected" | "completed"
      service_category: "coaching" | "tools" | "programs"
      user_type: "client" | "admin" | "individual"
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
    Enums: {
      registration_status: ["pending", "approved", "rejected", "completed"],
      service_category: ["coaching", "tools", "programs"],
      user_type: ["client", "admin", "individual"],
    },
  },
} as const
