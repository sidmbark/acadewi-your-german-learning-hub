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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cours: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          groupe_id: string | null
          heure: string
          id: string
          lien_zoom: string
          professeur_id: string | null
          statut: string | null
          titre: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          groupe_id?: string | null
          heure: string
          id?: string
          lien_zoom: string
          professeur_id?: string | null
          statut?: string | null
          titre: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          groupe_id?: string | null
          heure?: string
          id?: string
          lien_zoom?: string
          professeur_id?: string | null
          statut?: string | null
          titre?: string
        }
        Relationships: [
          {
            foreignKeyName: "cours_groupe_id_fkey"
            columns: ["groupe_id"]
            isOneToOne: false
            referencedRelation: "groupes"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          cours_id: string | null
          date_upload: string | null
          fichier_url: string
          id: string
          taille: number | null
          titre: string
          type: string | null
        }
        Insert: {
          cours_id?: string | null
          date_upload?: string | null
          fichier_url: string
          id?: string
          taille?: number | null
          titre: string
          type?: string | null
        }
        Update: {
          cours_id?: string | null
          date_upload?: string | null
          fichier_url?: string
          id?: string
          taille?: number | null
          titre?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
      exercices: {
        Row: {
          date_creation: string | null
          duree: number | null
          groupe_id: string | null
          id: string
          questions: Json
          titre: string
          type: string
        }
        Insert: {
          date_creation?: string | null
          duree?: number | null
          groupe_id?: string | null
          id?: string
          questions: Json
          titre: string
          type: string
        }
        Update: {
          date_creation?: string | null
          duree?: number | null
          groupe_id?: string | null
          id?: string
          questions?: Json
          titre?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercices_groupe_id_fkey"
            columns: ["groupe_id"]
            isOneToOne: false
            referencedRelation: "groupes"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          date_assignation: string | null
          etudiant_id: string | null
          groupe_id: string | null
          id: string
        }
        Insert: {
          date_assignation?: string | null
          etudiant_id?: string | null
          groupe_id?: string | null
          id?: string
        }
        Update: {
          date_assignation?: string | null
          etudiant_id?: string | null
          groupe_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_groupe_id_fkey"
            columns: ["groupe_id"]
            isOneToOne: false
            referencedRelation: "groupes"
            referencedColumns: ["id"]
          },
        ]
      }
      groupes: {
        Row: {
          couleur: string | null
          created_at: string | null
          horaire: string | null
          id: string
          niveau: string
          nom: string
          professeur_id: string | null
        }
        Insert: {
          couleur?: string | null
          created_at?: string | null
          horaire?: string | null
          id?: string
          niveau: string
          nom: string
          professeur_id?: string | null
        }
        Update: {
          couleur?: string | null
          created_at?: string | null
          horaire?: string | null
          id?: string
          niveau?: string
          nom?: string
          professeur_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          date: string | null
          id: string
          lu: boolean | null
          message: string
          type: string
          user_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          lu?: boolean | null
          message: string
          type: string
          user_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          lu?: boolean | null
          message?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      presences: {
        Row: {
          cours_id: string | null
          date: string | null
          etudiant_id: string | null
          id: string
          present: boolean | null
        }
        Insert: {
          cours_id?: string | null
          date?: string | null
          etudiant_id?: string | null
          id?: string
          present?: boolean | null
        }
        Update: {
          cours_id?: string | null
          date?: string | null
          etudiant_id?: string | null
          id?: string
          present?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "presences_cours_id_fkey"
            columns: ["cours_id"]
            isOneToOne: false
            referencedRelation: "cours"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adresse: string | null
          created_at: string | null
          date_inscription: string | null
          id: string
          nom: string
          photo_paiement: string | null
          prenom: string
          statut: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          date_inscription?: string | null
          id: string
          nom: string
          photo_paiement?: string | null
          prenom: string
          statut?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          date_inscription?: string | null
          id?: string
          nom?: string
          photo_paiement?: string | null
          prenom?: string
          statut?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progression: {
        Row: {
          date_completion: string | null
          etudiant_id: string | null
          exercice_id: string | null
          id: string
          score: number | null
          tentatives: number | null
        }
        Insert: {
          date_completion?: string | null
          etudiant_id?: string | null
          exercice_id?: string | null
          id?: string
          score?: number | null
          tentatives?: number | null
        }
        Update: {
          date_completion?: string | null
          etudiant_id?: string | null
          exercice_id?: string | null
          id?: string
          score?: number | null
          tentatives?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progression_exercice_id_fkey"
            columns: ["exercice_id"]
            isOneToOne: false
            referencedRelation: "exercices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "etudiant" | "professeur" | "gestionnaire"
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
      app_role: ["etudiant", "professeur", "gestionnaire"],
    },
  },
} as const
