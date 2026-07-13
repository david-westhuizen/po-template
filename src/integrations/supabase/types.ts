// Supabase database types.
//
// Ships with the VANILLA multi-tenant tables the app needs — `profiles`,
// `organizations`, `organization_members` — plus the RPC signatures, so the
// typed client and supabase.rpc(...) calls compile out of the box. Regenerate
// from YOUR schema as you add tables:
//
//   npx supabase gen types typescript --project-id <your-ref> > src/integrations/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface OrganizationRow {
  id: string;
  name: string;
  slug: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: OrganizationRow;
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_org_member: {
        Args: { _org: string };
        Returns: boolean;
      };
      has_org_role: {
        Args: { _org: string; _role: string };
        Returns: boolean;
      };
      create_organization: {
        Args: { _name: string; _slug?: string | null };
        Returns: OrganizationRow;
      };
      signup_create_workspace: {
        Args: { _role: string; _name?: string | null };
        Returns: OrganizationRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
