export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          display_order: number | null
          icon: string | null
          id: string
          layer: string
          name: string
          show_in_editorial: boolean
          slug: string
          town_id: string | null
        }
        Insert: {
          color?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          layer: string
          name: string
          show_in_editorial?: boolean
          slug: string
          town_id?: string | null
        }
        Update: {
          color?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          layer?: string
          name?: string
          show_in_editorial?: boolean
          slug?: string
          town_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          context: string | null
          created_at: string | null
          decision: string
          id: string
          reasoning: string | null
          title: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          decision: string
          id?: string
          reasoning?: string | null
          title: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          decision?: string
          id?: string
          reasoning?: string | null
          title?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          category_id: string | null
          created_at: string | null
          curation_order: number | null
          full_description: string | null
          id: string
          is_featured: boolean | null
          is_premium: boolean | null
          is_published: boolean | null
          latitude: number
          longitude: number
          name: string
          narrative: string | null
          opening_hours: Json | null
          phone: string | null
          place_id: string | null
          qr_code_url: string | null
          route_slug: string | null
          short_description: string | null
          show_in_editorial: boolean
          show_on_map: boolean | null
          slug: string
          town_id: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          curation_order?: number | null
          full_description?: string | null
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          latitude: number
          longitude: number
          name: string
          narrative?: string | null
          opening_hours?: Json | null
          phone?: string | null
          place_id?: string | null
          qr_code_url?: string | null
          route_slug?: string | null
          short_description?: string | null
          show_in_editorial?: boolean
          show_on_map?: boolean | null
          slug: string
          town_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          curation_order?: number | null
          full_description?: string | null
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_published?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          narrative?: string | null
          opening_hours?: Json | null
          phone?: string | null
          place_id?: string | null
          qr_code_url?: string | null
          route_slug?: string | null
          short_description?: string | null
          show_in_editorial?: boolean
          show_on_map?: boolean | null
          slug?: string
          town_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_premium: boolean | null
          location_id: string | null
          type: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_premium?: boolean | null
          location_id?: string | null
          type?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_premium?: boolean | null
          location_id?: string | null
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      memory: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      outputs: {
        Row: {
          agent: string
          created_at: string | null
          id: string
          prompt: string | null
          response: string | null
          task_id: string | null
          version: number | null
        }
        Insert: {
          agent: string
          created_at?: string | null
          id?: string
          prompt?: string | null
          response?: string | null
          task_id?: string | null
          version?: number | null
        }
        Update: {
          agent?: string
          created_at?: string | null
          id?: string
          prompt?: string | null
          response?: string | null
          task_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outputs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      place_functions: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          is_primary: boolean
          label: string
          opening_hours: Json | null
          phone: string | null
          place_id: string
          website: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_primary?: boolean
          label: string
          opening_hours?: Json | null
          phone?: string | null
          place_id: string
          website?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_primary?: boolean
          label?: string
          opening_hours?: Json | null
          phone?: string | null
          place_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "place_functions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_functions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          created_at: string | null
          historical_narrative: string | null
          id: string
          is_published: boolean
          latitude: number
          longitude: number
          name: string
          og_image_url: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          show_on_map: boolean
          slug: string
          town_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          historical_narrative?: string | null
          id?: string
          is_published?: boolean
          latitude: number
          longitude: number
          name: string
          og_image_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          show_on_map?: boolean
          slug: string
          town_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          historical_narrative?: string | null
          id?: string
          is_published?: boolean
          latitude?: number
          longitude?: number
          name?: string
          og_image_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          show_on_map?: boolean
          slug?: string
          town_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          target_agent: string
          template: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          target_agent: string
          template: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          target_agent?: string
          template?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          distance_meters: number | null
          duration_minutes: number | null
          geojson: Json
          id: string
          is_published: boolean
          name: string
          slug: string
          start_lat: number | null
          start_lng: number | null
          town_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          duration_minutes?: number | null
          geojson: Json
          id?: string
          is_published?: boolean
          name: string
          slug: string
          start_lat?: number | null
          start_lng?: number | null
          town_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          duration_minutes?: number | null
          geojson?: Json
          id?: string
          is_published?: boolean
          name?: string
          slug?: string
          start_lat?: number | null
          start_lng?: number | null
          town_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          author: string | null
          body: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          is_premium: boolean
          is_published: boolean
          published_at: string | null
          slug: string
          subtitle: string | null
          theme: string | null
          title: string
          town_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          is_published?: boolean
          published_at?: string | null
          slug: string
          subtitle?: string | null
          theme?: string | null
          title: string
          town_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          is_published?: boolean
          published_at?: string | null
          slug?: string
          subtitle?: string | null
          theme?: string | null
          title?: string
          town_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      task_links: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_links_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          artifact_links: string | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          execution_status: string | null
          id: string
          implementation_notes: string | null
          last_action_note: string | null
          last_run_at: string | null
          last_run_note: string | null
          last_run_target: string | null
          latest_output: string | null
          next_step: string | null
          priority: number | null
          related_area: string | null
          review_note: string | null
          source_prompt: string | null
          status: string
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artifact_links?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          execution_status?: string | null
          id?: string
          implementation_notes?: string | null
          last_action_note?: string | null
          last_run_at?: string | null
          last_run_note?: string | null
          last_run_target?: string | null
          latest_output?: string | null
          next_step?: string | null
          priority?: number | null
          related_area?: string | null
          review_note?: string | null
          source_prompt?: string | null
          status?: string
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artifact_links?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          execution_status?: string | null
          id?: string
          implementation_notes?: string | null
          last_action_note?: string | null
          last_run_at?: string | null
          last_run_note?: string | null
          last_run_target?: string | null
          latest_output?: string | null
          next_step?: string | null
          priority?: number | null
          related_area?: string | null
          review_note?: string | null
          source_prompt?: string | null
          status?: string
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tour_stops: {
        Row: {
          id: string
          location_id: string | null
          stop_narrative: string | null
          stop_order: number
          tour_id: string | null
        }
        Insert: {
          id?: string
          location_id?: string | null
          stop_narrative?: string | null
          stop_order: number
          tour_id?: string | null
        }
        Update: {
          id?: string
          location_id?: string | null
          stop_narrative?: string | null
          stop_order?: number
          tour_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_stops_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_stops_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          distance_meters: number | null
          duration_minutes: number | null
          id: string
          is_premium: boolean | null
          is_published: boolean
          name: string
          slug: string
          tour_type: string | null
          town_id: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean
          name: string
          slug: string
          tour_type?: string | null
          town_id?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          distance_meters?: number | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean
          name?: string
          slug?: string
          tour_type?: string | null
          town_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_town_id_fkey"
            columns: ["town_id"]
            isOneToOne: false
            referencedRelation: "towns"
            referencedColumns: ["id"]
          },
        ]
      }
      towns: {
        Row: {
          country: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          region: string | null
          slug: string
        }
        Insert: {
          country: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          region?: string | null
          slug: string
        }
        Update: {
          country?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          region?: string | null
          slug?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_premium: boolean | null
          premium_until: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_premium?: boolean | null
          premium_until?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_premium?: boolean | null
          premium_until?: string | null
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
