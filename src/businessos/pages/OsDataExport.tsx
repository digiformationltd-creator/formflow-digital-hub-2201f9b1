import { useState } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Database, FileJson, FileArchive, Loader2 } from "lucide-react";

type ExportPayload = {
  generated_at: string;
  table_count: number;
  total_rows: number;
  counts: Record<string, number>;
  errors?: Record<string, string>;
  tables: Record<string, any[]>;
};

function csvCell(value: any) {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: any[]) {
  if (!rows.length) return "";
  const cols = Array.from(rows.reduce((set: Set<string>, r) => {
    Object.keys(r ?? {}).forEach((k) => set.add(k));
    return set;
  }, new Set<string>()));
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => csvCell(r?.[c])).join(","));
  return lines.join("\n");
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OsDataExport() {
  const [busy, setBusy] = useState<null | "json" | "zip">(null);
  const [result, setResult] = useState<ExportPayload | null>(null);

  async function fetchAll(): Promise<ExportPayload> {
    const { data, error } = await supabase.functions.invoke("admin-export-all", {
      body: {},
    });
    if (error) throw new Error(error.message);
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as ExportPayload;
  }

  const stamp = () => new Date().toISOString().slice(0, 10);

  async function run(kind: "json" | "zip") {
    setBusy(kind);
    try {
      const payload = await fetchAll();
      setResult(payload);

      if (kind === "json") {
        saveBlob(
          new Blob([JSON.stringify(payload.tables, null, 2)], { type: "application/json" }),
          `digiformation-full-backup-${stamp()}.json`,
        );
      } else {
        const zip = new JSZip();
        for (const [table, rows] of Object.entries(payload.tables)) {
          zip.file(`${table}.csv`, toCsv(rows));
        }
        zip.file(
          "_manifest.json",
          JSON.stringify(
            {
              generated_at: payload.generated_at,
              table_count: payload.table_count,
              total_rows: payload.total_rows,
              counts: payload.counts,
              errors: payload.errors ?? null,
            },
            null,
            2,
          ),
        );
        const blob = await zip.generateAsync({ type: "blob" });
        saveBlob(blob, `digiformation-full-backup-csv-${stamp()}.zip`);
      }

      toast.success(
        `Exported ${payload.table_count} tables · ${payload.total_rows.toLocaleString()} rows`,
      );
      if (payload.errors) toast.warning("Some tables reported errors — see the list below.");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setBusy(null);
    }
  }

  const rows = result ? Object.entries(result.counts).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export All Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-only full backup. Reads every table and every row directly on the server, so
          nothing is filtered out.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => run("json")} disabled={!!busy} size="lg">
            {busy === "json" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileJson className="mr-2 h-4 w-4" />
            )}
            Download full backup (JSON)
          </Button>
          <Button onClick={() => run("zip")} disabled={!!busy} size="lg" variant="secondary">
            {busy === "zip" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="mr-2 h-4 w-4" />
            )}
            Download CSV pack (ZIP)
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          Large exports can take a minute — keep this page open until the download starts.
        </p>
      </Card>

      {result && (
        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-6 text-sm">
            <span className="font-medium">
              {result.table_count} tables
            </span>
            <span className="font-medium">
              {result.total_rows.toLocaleString()} rows total
            </span>
            <span className="text-muted-foreground">
              Generated {new Date(result.generated_at).toLocaleString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Table</th>
                  <th className="py-2 pr-4 font-medium">Rows exported</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([table, count]) => (
                  <tr key={table} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs">{table}</td>
                    <td className="py-2 pr-4 tabular-nums">{count.toLocaleString()}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {result.errors?.[table] ? result.errors[table] : "OK"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Downloads can be re-run any time from this page.
          </p>
        </Card>
      )}
    </div>
  );
}
