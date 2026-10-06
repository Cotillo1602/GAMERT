// Archivo generado por `npm run types:gen` — no editar a mano.
// Fuente: supabase/migrations/0001_init.sql (contrato en docs/DATABASE.md §6).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      daily_series: {
        Row: {
          id: string;
          tournament_id: string;
          days: number[];
          horizon_days: number;
        };
        Insert: {
          id: string;
          tournament_id: string;
          days: number[];
          horizon_days?: number;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          days?: number[];
          horizon_days?: number;
        };
        Relationships: [
          {
            foreignKeyName: "daily_series_tournament_id_fkey";
            columns: ["tournament_id"];
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      elo_ratings: {
        Row: {
          player_id: string;
          game_id: string;
          rating: number;
          played: number;
          wins: number;
          losses: number;
          draws: number;
          peak: number;
          streak: number;
          updated_at: string;
        };
        Insert: {
          player_id: string;
          game_id: string;
          rating?: number;
          played?: number;
          wins?: number;
          losses?: number;
          draws?: number;
          peak?: number;
          streak?: number;
          updated_at?: string;
        };
        Update: {
          player_id?: string;
          game_id?: string;
          rating?: number;
          played?: number;
          wins?: number;
          losses?: number;
          draws?: number;
          peak?: number;
          streak?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "elo_ratings_game_id_fkey";
            columns: ["game_id"];
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "elo_ratings_player_id_fkey";
            columns: ["player_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          id: string;
          name: string;
          short: string;
          icon: string;
          accent: string;
          description: string;
          popular: boolean;
          publisher: string;
          publisher_id: string | null;
        };
        Insert: {
          id: string;
          name: string;
          short: string;
          icon?: string;
          accent?: string;
          description?: string;
          popular?: boolean;
          publisher?: string;
          publisher_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          short?: string;
          icon?: string;
          accent?: string;
          description?: string;
          popular?: boolean;
          publisher?: string;
          publisher_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "games_publisher_id_fkey";
            columns: ["publisher_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      match_events: {
        Row: {
          id: number;
          match_id: string;
          actor_id: string | null;
          kind: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          match_id: string;
          actor_id?: string | null;
          kind: string;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          match_id?: string;
          actor_id?: string | null;
          kind?: string;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_events_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_events_match_id_fkey";
            columns: ["match_id"];
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          slot: number;
          round: number;
          round_label: string;
          a: string | null;
          b: string | null;
          elo_snapshot: Json | null;
          score_a: number | null;
          score_b: number | null;
          status: string;
          winner_to: string | null;
          winner_slot: string | null;
          reported_by: string | null;
          reported_at: string | null;
          needs_confirmation: boolean;
          disputed: boolean;
          report_reason: string | null;
          scheduled_at: string | null;
          starts_at: string;
        };
        Insert: {
          id: string;
          tournament_id: string;
          slot: number;
          round: number;
          round_label: string;
          a?: string | null;
          b?: string | null;
          elo_snapshot?: Json | null;
          score_a?: number | null;
          score_b?: number | null;
          status?: string;
          winner_to?: string | null;
          winner_slot?: string | null;
          reported_by?: string | null;
          reported_at?: string | null;
          needs_confirmation?: boolean;
          disputed?: boolean;
          report_reason?: string | null;
          scheduled_at?: string | null;
          starts_at: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          slot?: number;
          round?: number;
          round_label?: string;
          a?: string | null;
          b?: string | null;
          elo_snapshot?: Json | null;
          score_a?: number | null;
          score_b?: number | null;
          status?: string;
          winner_to?: string | null;
          winner_slot?: string | null;
          reported_by?: string | null;
          reported_at?: string | null;
          needs_confirmation?: boolean;
          disputed?: boolean;
          report_reason?: string | null;
          scheduled_at?: string | null;
          starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_a_fkey";
            columns: ["a"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_b_fkey";
            columns: ["b"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_reported_by_fkey";
            columns: ["reported_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_tournament_id_fkey";
            columns: ["tournament_id"];
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          kind: string;
          game_id: string | null;
          read: boolean;
          date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          kind?: string;
          game_id?: string | null;
          read?: boolean;
          date?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          kind?: string;
          game_id?: string | null;
          read?: boolean;
          date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_game_id_fkey";
            columns: ["game_id"];
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          handle: string;
          tier: string;
          verified_prizes: boolean;
          followers: number;
          game_ids: string[];
        };
        Insert: {
          id: string;
          name: string;
          handle: string;
          tier?: string;
          verified_prizes?: boolean;
          followers?: number;
          game_ids?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          handle?: string;
          tier?: string;
          verified_prizes?: boolean;
          followers?: number;
          game_ids?: string[];
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          handle: string;
          main_game: string | null;
          avatar_url: string | null;
          joined: string;
          scouted: boolean;
          role: string;
          organizer_tier: string;
          verified_prizes: boolean;
          disputes_lost: number;
          followers: number;
          bio: string | null;
          is_publisher: boolean;
          settings: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          handle: string;
          main_game?: string | null;
          avatar_url?: string | null;
          joined?: string;
          scouted?: boolean;
          role?: string;
          organizer_tier?: string;
          verified_prizes?: boolean;
          disputes_lost?: number;
          followers?: number;
          bio?: string | null;
          is_publisher?: boolean;
          settings?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          handle?: string;
          main_game?: string | null;
          avatar_url?: string | null;
          joined?: string;
          scouted?: boolean;
          role?: string;
          organizer_tier?: string;
          verified_prizes?: boolean;
          disputes_lost?: number;
          followers?: number;
          bio?: string | null;
          is_publisher?: boolean;
          settings?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_main_game_fkey";
            columns: ["main_game"];
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      registrations: {
        Row: {
          id: string;
          tournament_id: string;
          player_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          player_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          player_id?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_player_id_fkey";
            columns: ["player_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_tournament_id_fkey";
            columns: ["tournament_id"];
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          game_id: string;
          organizer_id: string;
          publisher_tier: string;
          modality: string;
          format: string;
          date: string;
          time: string;
          timezone: string;
          slots: number;
          enrolled: number;
          prize: Json;
          rules: Json;
          status: string;
          phase: string | null;
          featured: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          game_id: string;
          organizer_id: string;
          publisher_tier?: string;
          modality?: string;
          format?: string;
          date: string;
          time?: string;
          timezone?: string;
          slots: number;
          enrolled?: number;
          prize?: Json;
          rules?: Json;
          status?: string;
          phase?: string | null;
          featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          game_id?: string;
          organizer_id?: string;
          publisher_tier?: string;
          modality?: string;
          format?: string;
          date?: string;
          time?: string;
          timezone?: string;
          slots?: number;
          enrolled?: number;
          prize?: Json;
          rules?: Json;
          status?: string;
          phase?: string | null;
          featured?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournaments_game_id_fkey";
            columns: ["game_id"];
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey";
            columns: ["organizer_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      bracket_size_for: { Args: { p_n: number }; Returns: number };
      can_organize: { Args: { p_user_id: string }; Returns: boolean };
      cancel_tournament: { Args: { p_tournament_id: string }; Returns: Json };
      confirm_result: { Args: { p_match_id: string }; Returns: Json };
      create_tournament: { Args: { p_payload: Json }; Returns: Json };
      dispute_result: { Args: { p_match_id: string; p_reason: string }; Returns: Json };
      elo_expected: { Args: { p_rating: number; p_opponent: number }; Returns: number };
      elo_k_factor: { Args: { p_rating: number; p_played: number }; Returns: number };
      elo_margin_mult: { Args: { p_diff: number }; Returns: number };
      finish_match: { Args: { p_match_id: string; p_event_kind?: string }; Returns: Json };
      forfeit_match: { Args: { p_match_id: string; p_loser: string }; Returns: Json };
      generate_bracket: { Args: { p_tournament_id: string }; Returns: Json };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      join_tournament: { Args: { p_tournament_id: string }; Returns: Json };
      leave_tournament: { Args: { p_tournament_id: string }; Returns: Json };
      mark_notifications_read: { Args: Record<PropertyKey, never>; Returns: Json };
      notify: {
        Args: { p_user: string; p_title: string; p_body: string; p_kind?: string; p_game?: string };
        Returns: undefined;
      };
      rate_player: {
        Args: {
          p_player: string;
          p_game: string;
          p_score: number;
          p_opponent_rating: number;
          p_diff: number;
        };
        Returns: number;
      };
      report_result: {
        Args: { p_match_id: string; p_score_a: number; p_score_b: number; p_reason?: string };
        Returns: Json;
      };
      resolve_dispute: {
        Args: { p_match_id: string; p_score_a: number; p_score_b: number; p_reason?: string };
        Returns: Json;
      };
      round_label: { Args: { p_round: number; p_size: number }; Returns: string };
      start_tournament: { Args: { p_tournament_id: string }; Returns: Json };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Views<T extends keyof Database["public"]["Views"]> = Database["public"]["Views"][T];
export type Functions<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
export type CompositeTypes<T extends keyof Database["public"]["CompositeTypes"]> =
  Database["public"]["CompositeTypes"][T];

export type Schema = Database["public"];

export interface StructuredError {
  message: string;
  details: string;
  hint: string;
  code: string;
}
