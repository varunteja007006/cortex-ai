"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/data-table";
import { Loader2, RefreshCw, Scan } from "lucide-react";
import { useDocuments, useScanDocuments } from "@/api/documents/query";
import type { Document } from "@/api/documents/types";
import { formatDate, truncateHash } from "@/api/documents/helpers";

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
    accessor: (doc) => truncateHash(doc.fileHash),
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
    accessor: (doc) => formatDate(doc.createdAt),
  },
];

export function DocumentsTable() {
  const {
    data: documents,
    isLoading,
    isRefetching,
    refetch,
  } = useDocuments();

  const scanMutation = useScanDocuments();

  const handleScan = () => {
    scanMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (!data.success) {
          // The error toast/feedback can be handled at a higher level
          console.error("Scan failed:", data.error);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tracked Documents</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${documents?.length ?? 0} document${documents?.length === 1 ? "" : "s"} tracked`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {scanMutation.isSuccess && scanMutation.data?.success && (
            <span className="text-sm text-muted-foreground">
              Scan complete — found {scanMutation.data.scanned} file(s)
            </span>
          )}
          {scanMutation.isError && (
            <span className="text-sm text-destructive">
              {scanMutation.error?.message ?? "Scan failed"}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleScan}
            disabled={scanMutation.isPending}
            size="sm"
          >
            {scanMutation.isPending ? (
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
        data={documents ?? []}
        keyExtractor={(doc) => doc.id}
        loading={isLoading}
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
