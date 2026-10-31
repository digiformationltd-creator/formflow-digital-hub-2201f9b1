import type { Database } from "@/integrations/supabase/types";

/** Row and RPC shapes come from the project's generated database contract. */
export type DbRow<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name]["Row"];
export type DbInsert<Name extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][Name]["Insert"];
export type RpcResult<Name extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][Name]["Returns"];

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
