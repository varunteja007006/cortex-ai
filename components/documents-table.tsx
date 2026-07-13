"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { Loader2, RefreshCw, Scan } from "lucide-react";

type Document = {
  id: string;
  filename: string;
  filepath: string;
  fileHash: string;
  ingested: boolean;
  createdAt: string;
  updatedAt: string;
};

type ScanResponse =
  | { success: true; scanned: number; results: unknown[] }
  | { success: false; error: string };

const columns: Column<Document>[] = [
  {
    header: "Filename",
    accessor: (doc) => (
      <span className="font-medium">{doc.filename}</span>
    ),
  },
  {
    header: "Path",
    headClassName: "hidden md:table-cell",
    cellClassName: "hidden max-w-[240px] truncate text-muted-foreground md:table-cell",
    accessor: (doc) => doc.filepath,
  },
  {
    header: "Hash",
    headClassName: "hidden sm:table-cell",
    cellClassName:
      "hidden font-mono text-xs text-muted-foreground sm:table-cell",
    accessor: (doc) =>
      doc.fileHash.length > 16
        ? `${doc.fileHash.slice(0, 16)}…`
        : doc.fileHash,
  },
  {
    header: "Status",
    accessor: (doc) =>
      doc.ingested ? (
        <Badge variant="default">Ingested</Badge>
      ) : (
        <Badge variant="secondary">Pending</Badge>
      ),
  },
  {
    header: "Created",
    headClassName: "hidden lg:table-cell",
    cellClassName: "hidden text-muted-foreground lg:table-cell",
    accessor: (doc) =>
      new Date(doc.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
];

export function DocumentsTable() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleScan() {
    setScanning(true);
    setScanFeedback(null);
    try {
      const res = await fetch("/api/scan-docs");
      const data: ScanResponse = await res.json();
      if (data.success) {
        setScanFeedback(
          `Scan complete — found ${data.scanned} file(s)`,
        );
        await fetchDocuments();
      } else {
        setScanFeedback(
          "error" in data ? data.error : "Scan failed",
        );
      }
    } catch (err) {
      setScanFeedback(
        err instanceof Error ? err.message : "Request failed",
      );
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tracked Documents</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${documents.length} document${documents.length === 1 ? "" : "s"} tracked`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {scanFeedback && (
            <span className="text-sm text-muted-foreground">
              {scanFeedback}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleScan} disabled={scanning} size="sm">
            {scanning ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Scan className="mr-1 h-4 w-4" />
                Scan Docs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={documents}
        keyExtractor={(doc) => doc.id}
        loading={loading}
        emptyMessage={
          <>
            No documents tracked yet. Click <strong>Scan Docs</strong> to scan
            the <code>docs/</code> folder.
          </>
        }
      />
    </div>
  );
}
