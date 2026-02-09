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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          group_id: string
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          group_id: string
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          group_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "category_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      category_groups: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_data: Json
          client_ip: string | null
          created_at: string | null
          id: string
          proposal_id: string
          signature_image_path: string | null
          signature_image_url: string | null
          signed_at: string
          signed_content: string
          user_agent: string | null
        }
        Insert: {
          client_data?: Json
          client_ip?: string | null
          created_at?: string | null
          id?: string
          proposal_id: string
          signature_image_path?: string | null
          signature_image_url?: string | null
          signed_at?: string
          signed_content: string
          user_agent?: string | null
        }
        Update: {
          client_data?: Json
          client_ip?: string | null
          created_at?: string | null
          id?: string
          proposal_id?: string
          signature_image_path?: string | null
          signature_image_url?: string | null
          signed_at?: string
          signed_content?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string | null
          profile_id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id?: string | null
          profile_id: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          profile_id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          access_password: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          downloads_count: number | null
          event_date: string | null
          expires_at: string
          id: string
          photos_count: number | null
          profile_id: string
          slug: string
          status: string | null
          title: string
          total_size_bytes: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          access_password?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          downloads_count?: number | null
          event_date?: string | null
          expires_at: string
          id?: string
          photos_count?: number | null
          profile_id: string
          slug: string
          status?: string | null
          title: string
          total_size_bytes?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          access_password?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          downloads_count?: number | null
          event_date?: string | null
          expires_at?: string
          id?: string
          photos_count?: number | null
          profile_id?: string
          slug?: string
          status?: string | null
          title?: string
          total_size_bytes?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "galleries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_favorites: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          photo_id: string
          visitor_hash: string
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          photo_id: string
          visitor_hash: string
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          photo_id?: string
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_favorites_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_favorites_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "gallery_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_photos: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number | null
          file_url: string
          filename: string
          gallery_id: string
          height: number | null
          id: string
          order_index: number | null
          thumbnail_url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_url: string
          filename: string
          gallery_id: string
          height?: number | null
          id?: string
          order_index?: number | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_url?: string
          filename?: string
          gallery_id?: string
          height?: number | null
          id?: string
          order_index?: number | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ai_summary: string | null
          browser_fingerprint: string | null
          budget_signal: string | null
          conversation_phase: string | null
          created_at: string
          data_completeness: number | null
          email: string | null
          event_date: string | null
          event_location: string | null
          heat_level: string | null
          id: string
          instagram_id: string | null
          interest_category:
            | Database["public"]["Enums"]["story_category"]
            | null
          interest_category_id: string | null
          last_interaction_at: string | null
          name: string | null
          notes: string | null
          profile_id: string
          service_type: string | null
          session_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          style_preference: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ai_summary?: string | null
          browser_fingerprint?: string | null
          budget_signal?: string | null
          conversation_phase?: string | null
          created_at?: string
          data_completeness?: number | null
          email?: string | null
          event_date?: string | null
          event_location?: string | null
          heat_level?: string | null
          id?: string
          instagram_id?: string | null
          interest_category?:
            | Database["public"]["Enums"]["story_category"]
            | null
          interest_category_id?: string | null
          last_interaction_at?: string | null
          name?: string | null
          notes?: string | null
          profile_id: string
          service_type?: string | null
          session_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          style_preference?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ai_summary?: string | null
          browser_fingerprint?: string | null
          budget_signal?: string | null
          conversation_phase?: string | null
          created_at?: string
          data_completeness?: number | null
          email?: string | null
          event_date?: string | null
          event_location?: string | null
          heat_level?: string | null
          id?: string
          instagram_id?: string | null
          interest_category?:
            | Database["public"]["Enums"]["story_category"]
            | null
          interest_category_id?: string | null
          last_interaction_at?: string | null
          name?: string | null
          notes?: string | null
          profile_id?: string
          service_type?: string | null
          session_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          style_preference?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_interest_category_id_fkey"
            columns: ["interest_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      minisite_carousel_photos: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          order_index: number | null
          profile_id: string
          thumbnail_url: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          order_index?: number | null
          profile_id: string
          thumbnail_url: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          order_index?: number | null
          profile_id?: string
          thumbnail_url?: string
          width?: number | null
        }
        Relationships: []
      }
      payment_configs: {
        Row: {
          account_document: string | null
          account_holder: string | null
          additional_instructions: string | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          payment_link_url: string | null
          payment_type: string
          pix_holder_name: string | null
          pix_key: string | null
          pix_key_type: string | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          account_document?: string | null
          account_holder?: string | null
          additional_instructions?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          payment_link_url?: string | null
          payment_type: string
          pix_holder_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          account_document?: string | null
          account_holder?: string | null
          additional_instructions?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          payment_link_url?: string | null
          payment_type?: string
          pix_holder_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_configs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_path: string
          file_url: string
          id: string
          notes: string | null
          proposal_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_path: string
          file_url: string
          id?: string
          notes?: string | null
          proposal_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string
          file_url?: string
          id?: string
          notes?: string | null
          proposal_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_photo_url: string | null
          about_text: string | null
          about_video_url: string | null
          action_buttons: Json | null
          ai_context: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string
          created_at: string
          custom_domain: string | null
          google_calendar_connected: boolean | null
          google_calendar_connected_at: string | null
          id: string
          leads_limit: number
          leads_used_this_month: number
          luma_avatar_url: string | null
          luma_initial_message: string | null
          luma_status: string | null
          minisite_avatar_url: string | null
          minisite_carousel_layout: string | null
          minisite_cover_url: string | null
          minisite_footer_cta_label: string | null
          minisite_footer_cta_url: string | null
          minisite_headline: string | null
          minisite_subheadline: string | null
          minisite_theme: string | null
          niche: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          pricing_packages: Json | null
          show_category_chips: boolean
          show_story_carousel: boolean
          slug: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          about_photo_url?: string | null
          about_text?: string | null
          about_video_url?: string | null
          action_buttons?: Json | null
          ai_context?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string
          created_at?: string
          custom_domain?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_connected_at?: string | null
          id: string
          leads_limit?: number
          leads_used_this_month?: number
          luma_avatar_url?: string | null
          luma_initial_message?: string | null
          luma_status?: string | null
          minisite_avatar_url?: string | null
          minisite_carousel_layout?: string | null
          minisite_cover_url?: string | null
          minisite_footer_cta_label?: string | null
          minisite_footer_cta_url?: string | null
          minisite_headline?: string | null
          minisite_subheadline?: string | null
          minisite_theme?: string | null
          niche?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          pricing_packages?: Json | null
          show_category_chips?: boolean
          show_story_carousel?: boolean
          slug?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          about_photo_url?: string | null
          about_text?: string | null
          about_video_url?: string | null
          action_buttons?: Json | null
          ai_context?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string
          created_at?: string
          custom_domain?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_connected_at?: string | null
          id?: string
          leads_limit?: number
          leads_used_this_month?: number
          luma_avatar_url?: string | null
          luma_initial_message?: string | null
          luma_status?: string | null
          minisite_avatar_url?: string | null
          minisite_carousel_layout?: string | null
          minisite_cover_url?: string | null
          minisite_footer_cta_label?: string | null
          minisite_footer_cta_url?: string | null
          minisite_headline?: string | null
          minisite_subheadline?: string | null
          minisite_theme?: string | null
          niche?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          pricing_packages?: Json | null
          show_category_chips?: boolean
          show_story_carousel?: boolean
          slug?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      proposal_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          details: string | null
          id: string
          name: string | null
          order_index: number | null
          proposal_id: string
          quantity: number | null
          show_price: boolean | null
          unit_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          details?: string | null
          id?: string
          name?: string | null
          order_index?: number | null
          proposal_id: string
          quantity?: number | null
          show_price?: boolean | null
          unit_price: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          details?: string | null
          id?: string
          name?: string | null
          order_index?: number | null
          proposal_id?: string
          quantity?: number | null
          show_price?: boolean | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          content: string
          created_at: string | null
          default_items: Json | null
          default_payment_config_id: string | null
          default_payment_info: string | null
          default_valid_days: number | null
          description: string | null
          id: string
          profile_id: string
          title: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          default_items?: Json | null
          default_payment_config_id?: string | null
          default_payment_info?: string | null
          default_valid_days?: number | null
          description?: string | null
          id?: string
          profile_id: string
          title: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string | null
          default_items?: Json | null
          default_payment_config_id?: string | null
          default_payment_info?: string | null
          default_valid_days?: number | null
          description?: string | null
          id?: string
          profile_id?: string
          title?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_templates_default_payment_config_id_fkey"
            columns: ["default_payment_config_id"]
            isOneToOne: false
            referencedRelation: "payment_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_templates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          approved_at: string | null
          change_request_notes: string | null
          client_email: string | null
          client_name: string | null
          contract_content: string | null
          contract_file_url: string | null
          cover_video_url: string | null
          created_at: string | null
          delivery_formats: string[] | null
          discount_amount: number | null
          estimated_duration_min: number | null
          id: string
          lead_id: string | null
          payment_config_id: string | null
          payment_info: string | null
          profile_id: string
          project_format: string | null
          proposal_type: string | null
          public_token: string | null
          reference_links: Json | null
          required_fields: string[] | null
          revision_limit: number | null
          sent_at: string | null
          soundtrack_links: Json | null
          status: Database["public"]["Enums"]["proposal_status"] | null
          template_id: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          use_manual_total: boolean | null
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          approved_at?: string | null
          change_request_notes?: string | null
          client_email?: string | null
          client_name?: string | null
          contract_content?: string | null
          contract_file_url?: string | null
          cover_video_url?: string | null
          created_at?: string | null
          delivery_formats?: string[] | null
          discount_amount?: number | null
          estimated_duration_min?: number | null
          id?: string
          lead_id?: string | null
          payment_config_id?: string | null
          payment_info?: string | null
          profile_id: string
          project_format?: string | null
          proposal_type?: string | null
          public_token?: string | null
          reference_links?: Json | null
          required_fields?: string[] | null
          revision_limit?: number | null
          sent_at?: string | null
          soundtrack_links?: Json | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          template_id?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          use_manual_total?: boolean | null
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          approved_at?: string | null
          change_request_notes?: string | null
          client_email?: string | null
          client_name?: string | null
          contract_content?: string | null
          contract_file_url?: string | null
          cover_video_url?: string | null
          created_at?: string | null
          delivery_formats?: string[] | null
          discount_amount?: number | null
          estimated_duration_min?: number | null
          id?: string
          lead_id?: string | null
          payment_config_id?: string | null
          payment_info?: string | null
          profile_id?: string
          project_format?: string | null
          proposal_type?: string | null
          public_token?: string | null
          reference_links?: Json | null
          required_fields?: string[] | null
          revision_limit?: number | null
          sent_at?: string | null
          soundtrack_links?: Json | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          template_id?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          use_manual_total?: boolean | null
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_payment_config_id_fkey"
            columns: ["payment_config_id"]
            isOneToOne: false
            referencedRelation: "payment_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "proposal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_keys: Json
          created_at: string
          endpoint: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          auth_keys: Json
          created_at?: string
          endpoint: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          auth_keys?: Json
          created_at?: string
          endpoint?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          category: Database["public"]["Enums"]["story_category"]
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          is_published: boolean
          profile_id: string
          show_in_carousel: boolean
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          category: Database["public"]["Enums"]["story_category"]
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          profile_id: string
          show_in_carousel?: boolean
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["story_category"]
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          profile_id?: string
          show_in_carousel?: boolean
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_chapters: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          narrative_text: string | null
          order_index: number
          story_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type?: string
          media_url: string
          narrative_text?: string | null
          order_index?: number
          story_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          narrative_text?: string | null
          order_index?: number
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_chapters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          story_id: string
          viewed_at: string
          visitor_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          story_id: string
          viewed_at?: string
          visitor_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          story_id?: string
          viewed_at?: string
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_gallery_counter: {
        Args: { p_counter_type: string; p_gallery_id: string }
        Returns: undefined
      }
    }
    Enums: {
      lead_status:
        | "novo"
        | "em_contato"
        | "proposta_enviada"
        | "convertido"
        | "perdido"
        | "qualificando"
        | "engajado"
        | "pronto"
      plan_type:
        | "free"
        | "pro"
        | "enterprise"
        | "trial"
        | "lite"
        | "ultra"
        | "pending"
        | "canceled"
      proposal_status:
        | "draft"
        | "sent"
        | "viewed"
        | "approved"
        | "changes_requested"
        | "signed"
        | "paid"
        | "cancelled"
      story_category:
        | "casamento"
        | "newborn"
        | "familia"
        | "corporativo"
        | "moda"
        | "gastronomia"
        | "gestante"
        | "evento"
        | "preweeding"
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
      lead_status: [
        "novo",
        "em_contato",
        "proposta_enviada",
        "convertido",
        "perdido",
        "qualificando",
        "engajado",
        "pronto",
      ],
      plan_type: [
        "free",
        "pro",
        "enterprise",
        "trial",
        "lite",
        "ultra",
        "pending",
        "canceled",
      ],
      proposal_status: [
        "draft",
        "sent",
        "viewed",
        "approved",
        "changes_requested",
        "signed",
        "paid",
        "cancelled",
      ],
      story_category: [
        "casamento",
        "newborn",
        "familia",
        "corporativo",
        "moda",
        "gastronomia",
        "gestante",
        "evento",
        "preweeding",
      ],
    },
  },
} as const
