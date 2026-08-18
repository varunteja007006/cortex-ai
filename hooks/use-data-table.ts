"use client"

import { useCallback, useEffect, useMemo } from "react"
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type SortingState,
  type TableOptions,
} from "@tanstack/react-table"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- generic must match TableMeta<TData>
  interface TableMeta<TData extends RowData> {
    /** Label shown in table meta */
    label?: string
  }
}

type UseDataTableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  pageCount: number
  getRowId?: (row: TData) => string
  defaultPageSize?: number
  /** When any of these change, reset the page back to 1 */
  resetDeps?: string[]
}

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SORT = "createdAt"
export const DEFAULT_SORT_DIR = "desc"

/** Build a TanStack table whose pagination + sorting state is stored in the URL. */
export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  getRowId,
  defaultPageSize = 10,
  resetDeps = [],
}: UseDataTableOptions<TData>) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  )
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(defaultPageSize),
  )
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault(DEFAULT_SORT))
  const [sortDir, setSortDir] = useQueryState(
    "sortDir",
    parseAsString.withDefault(DEFAULT_SORT_DIR),
  )

  // Clamp the requested page to a valid range
  const safePage = Math.min(Math.max(1, page), Math.max(1, pageCount))
  const safePageSize = Math.max(1, pageSize)

  const sorting = useMemo<SortingState>(
    () => (sort ? [{ id: sort, desc: sortDir === "desc" }] : []),
    [sort, sortDir],
  )

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: safePage - 1, pageSize: safePageSize })
          : updater
      setPage(next.pageIndex + 1)
      setPageSize(next.pageSize)
    },
    [safePage, safePageSize, setPage, setPageSize],
  )

  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      const first = next?.[0]
      if (first) {
        setSort(first.id)
        setSortDir(first.desc ? "desc" : "asc")
      }
    },
    [sorting, setSort, setSortDir],
  )

  const tableOptions: TableOptions<TData> = {
    data,
    columns,
    pageCount: Math.max(1, pageCount),
    getRowId,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: safePage - 1,
        pageSize: safePageSize,
      },
      sorting,
    },
    onPaginationChange: handlePaginationChange,
    onSortingChange,
  }

  const table = useReactTable(tableOptions)

  // Reset the page whenever any of the filter values change
  const joinedDeps = resetDeps.join("|")
  useEffect(() => {
    setPage(1)
     
  }, [joinedDeps, setPage])

  return {
    table,
    page: safePage,
    setPage,
    pageSize: safePageSize,
    setPageSize,
    sort,
    sortDir,
    setSort,
    setSortDir,
    setSorting: onSortingChange,
  }
}