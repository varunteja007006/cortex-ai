"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { FileText } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { useDataTable } from "@/hooks/use-data-table"
import { useDocuments } from "@/api/documents/query"
import type { Document } from "@/api/documents/types"
import { formatDate, truncateHash } from "@/api/documents/helpers"
import { Badge } from "@/components/ui/badge"

const columns: ColumnDef<Document>[] = [
  {
    id: "filename",
    accessorKey: "filename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Filename" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{row.original.filename}</span>
        </div>
      )
    },
  },
  {
    id: "filepath",
    accessorKey: "filepath",
    header: "Path",
    cell: ({ row }) => (
      <span
        className="block max-w-64 truncate text-muted-foreground"
        title={row.original.filepath}
      >
        {row.original.filepath}
      </span>
    ),
  },
  {
    id: "fileHash",
    accessorKey: "fileHash",
    header: "Hash",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {truncateHash(row.original.fileHash)}
      </span>
    ),
  },
  {
    id: "ingested",
    accessorKey: "ingested",
    header: "Status",
    cell: ({ row }) => {
      const ingested = row.original.ingested
      return (
        <Badge variant={ingested ? "default" : "secondary"}>
          {ingested ? "Ingested" : "Pending"}
        </Badge>
      )
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
]

export function DocumentsDataTable() {
  const [search] = useQueryState("search", parseAsString.withDefault(""))

  const { table, page, pageSize, sort, sortDir } = useDataTable<Document>({
    data: [],
    columns,
    pageCount: 1,
    getRowId: (row) => row.id,
    resetDeps: [search],
  })

  const { data, isLoading, isFetching } = useDocuments({
    page,
    pageSize,
    sort: sort as DocumentSort,
    sortDir: sortDir as "asc" | "desc",
    search: search || undefined,
  })

  return (
    <DataTable
      table={table}
      loading={isLoading || isFetching}
      total={data?.total}
      emptyState={
        <>
          No documents found. Run <strong>Scan Docs</strong> to discover files
          in the <code>docs/</code> folder.
        </>
      }
    >
      <DataTableSearch placeholder="Search documents…" />
    </DataTable>
  )
}

type DocumentSort =
  | "filename"
  | "filepath"
  | "fileHash"
  | "ingested"
  | "createdAt"
  | "updatedAt"