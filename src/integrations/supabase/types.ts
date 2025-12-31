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
      badges: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string | null
          description: string
          icone: string
          id: string
          nom: string
          xp_reward: number
        }
        Insert: {
          condition_type: string
          condition_value: number
          created_at?: string | null
          description: string
          icone: string
          id?: string
          nom: string
          xp_reward?: number
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string | null
          description?: string
          icone?: string
          id?: string
          nom?: string
          xp_reward?: number
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          etudiant_id: string
          id: string
          professeur_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          etudiant_id: string
          id?: string
          professeur_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          etudiant_id?: string
          id?: string
          professeur_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          lu: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          lu?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          lu?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          date_soumission: string
          email: string
          id: string
          lu: boolean
          message: string
          nom: string
          telephone: string | null
        }
        Insert: {
          created_at?: string
          date_soumission?: string
          email: string
          id?: string
          lu?: boolean
          message: string
          nom: string
          telephone?: string | null
        }
        Update: {
          created_at?: string
          date_soumission?: string
          email?: string
          id?: string
          lu?: boolean
          message?: string
          nom?: string
          telephone?: string | null
        }
        Relationships: []
      }
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
      document_groupe_access: {
        Row: {
          created_at: string | null
          document_id: string | null
          groupe_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          groupe_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          groupe_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_groupe_access_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_groupe_access_groupe_id_fkey"
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
          professeur_id: string | null
          taille: number | null
          titre: string
          type: string | null
        }
        Insert: {
          cours_id?: string | null
          date_upload?: string | null
          fichier_url: string
          id?: string
          professeur_id?: string | null
          taille?: number | null
          titre: string
          type?: string | null
        }
        Update: {
          cours_id?: string | null
          date_upload?: string | null
          fichier_url?: string
          id?: string
          professeur_id?: string | null
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
          {
            foreignKeyName: "documents_professeur_id_fkey"
            columns: ["professeur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          coefficient: number | null
          created_at: string
          date_limite: string | null
          description: string | null
          groupe_id: string | null
          id: string
          note_max: number | null
          professeur_id: string
          titre: string
          type: string
        }
        Insert: {
          coefficient?: number | null
          created_at?: string
          date_limite?: string | null
          description?: string | null
          groupe_id?: string | null
          id?: string
          note_max?: number | null
          professeur_id: string
          titre: string
          type: string
        }
        Update: {
          coefficient?: number | null
          created_at?: string
          date_limite?: string | null
          description?: string | null
          groupe_id?: string | null
          id?: string
          note_max?: number | null
          professeur_id?: string
          titre?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_groupe_id_fkey"
            columns: ["groupe_id"]
            isOneToOne: false
            referencedRelation: "groupes"
            referencedColumns: ["id"]
          },
        ]
      }
      exercice_submissions: {
        Row: {
          commentaire_prof: string | null
          corrige: boolean | null
          date_soumission: string | null
          etudiant_id: string | null
          exercice_id: string | null
          fichiers_urls: string[] | null
          id: string
          note: number | null
          reponses: Json
        }
        Insert: {
          commentaire_prof?: string | null
          corrige?: boolean | null
          date_soumission?: string | null
          etudiant_id?: string | null
          exercice_id?: string | null
          fichiers_urls?: string[] | null
          id?: string
          note?: number | null
          reponses: Json
        }
        Update: {
          commentaire_prof?: string | null
          corrige?: boolean | null
          date_soumission?: string | null
          etudiant_id?: string | null
          exercice_id?: string | null
          fichiers_urls?: string[] | null
          id?: string
          note?: number | null
          reponses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "exercice_submissions_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercice_submissions_exercice_id_fkey"
            columns: ["exercice_id"]
            isOneToOne: false
            referencedRelation: "exercices"
            referencedColumns: ["id"]
          },
        ]
      }
      exercices: {
        Row: {
          date_creation: string | null
          duree: number | null
          fichier_url: string | null
          groupe_id: string | null
          id: string
          professeur_id: string | null
          questions: Json | null
          titre: string
          type: string
        }
        Insert: {
          date_creation?: string | null
          duree?: number | null
          fichier_url?: string | null
          groupe_id?: string | null
          id?: string
          professeur_id?: string | null
          questions?: Json | null
          titre: string
          type: string
        }
        Update: {
          date_creation?: string | null
          duree?: number | null
          fichier_url?: string | null
          groupe_id?: string | null
          id?: string
          professeur_id?: string | null
          questions?: Json | null
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
      notes: {
        Row: {
          commentaire: string | null
          created_at: string
          date_notation: string | null
          etudiant_id: string
          evaluation_id: string
          id: string
          note: number | null
        }
        Insert: {
          commentaire?: string | null
          created_at?: string
          date_notation?: string | null
          etudiant_id: string
          evaluation_id: string
          id?: string
          note?: number | null
        }
        Update: {
          commentaire?: string | null
          created_at?: string
          date_notation?: string | null
          etudiant_id?: string
          evaluation_id?: string
          id?: string
          note?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
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
          niveau: string | null
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
          niveau?: string | null
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
          niveau?: string | null
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
      user_badges: {
        Row: {
          badge_id: string
          date_obtention: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          date_obtention?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          date_obtention?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          cours_suivis: number
          created_at: string | null
          derniere_activite: string | null
          exercices_completes: number
          id: string
          meilleur_streak: number
          niveau: number
          notes_parfaites: number
          streak_actuel: number
          updated_at: string | null
          user_id: string
          xp_total: number
        }
        Insert: {
          cours_suivis?: number
          created_at?: string | null
          derniere_activite?: string | null
          exercices_completes?: number
          id?: string
          meilleur_streak?: number
          niveau?: number
          notes_parfaites?: number
          streak_actuel?: number
          updated_at?: string | null
          user_id: string
          xp_total?: number
        }
        Update: {
          cours_suivis?: number
          created_at?: string | null
          derniere_activite?: string | null
          exercices_completes?: number
          id?: string
          meilleur_streak?: number
          niveau?: number
          notes_parfaites?: number
          streak_actuel?: number
          updated_at?: string | null
          user_id?: string
          xp_total?: number
        }
        Relationships: []
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
      xp_history: {
        Row: {
          created_at: string | null
          id: string
          raison: string
          user_id: string
          xp_gagne: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          raison: string
          user_id: string
          xp_gagne: number
        }
        Update: {
          created_at?: string | null
          id?: string
          raison?: string
          user_id?: string
          xp_gagne?: number
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
