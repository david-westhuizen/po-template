import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * The "event bus" of this architecture.
 *
 * There is no in-memory pub/sub bus in a Lovable/raimonland app. Instead, the
 * source of truth is the database, and Supabase Realtime is the event stream:
 * a Postgres change is an event, and the reaction is invalidating the affected
 * React Query keys so the UI refetches. This hook wraps that pattern so every
 * feature subscribes the same way.
 *
 * Usage inside a feature hook:
 *   useRealtimeSync({
 *     table: "notes",
 *     queryKeys: [["notes"]],
 *     // filter: `org_id=eq.${orgId}`,  // optional Postgres filter
 *   });
 */
export interface RealtimeSyncOptions {
  /** Postgres table to watch. */
  table: string;
  /** React Query keys to invalidate when a change arrives. */
  queryKeys: readonly unknown[][];
  /** Optional Postgres filter, e.g. `org_id=eq.<uuid>`. */
  filter?: string;
  /** Which events to react to. Defaults to all. */
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  /** Supabase schema. Defaults to "public". */
  schema?: string;
  /** Set false to pause the subscription (e.g. before ids are known). */
  enabled?: boolean;
  /** Optional side-effect on each change, for cross-feature reactions. */
  onChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function useRealtimeSync({
  table,
  queryKeys,
  filter,
  event = "*",
  schema = "public",
  enabled = true,
  onChange,
}: RealtimeSyncOptions): void {
  const queryClient = useQueryClient();
  const keysSignature = JSON.stringify(queryKeys);

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime:${schema}:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event, schema, table, ...(filter ? { filter } : {}) },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          for (const key of queryKeys) {
            void queryClient.invalidateQueries({ queryKey: key });
          }
          onChange?.(payload);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // keysSignature stands in for queryKeys (arrays are unstable references)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, event, schema, enabled, keysSignature, queryClient]);
}
