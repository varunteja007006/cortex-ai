"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getDocuments, scanDocuments } from "./api";
import type { DocumentsResponse, DocumentsQuery, ScanResponse } from "./types";

/** Query key factory for documents domain */
export const documentKeys = {
  all: ["documents"] as const,
  list: (params: DocumentsQuery = {}) => ["documents", "list", params] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
};

/** Fetch a paginated list of tracked documents */
export function useDocuments(params: DocumentsQuery = {}) {
  return useQuery<DocumentsResponse>({
    queryKey: documentKeys.list(params),
    queryFn: () => getDocuments(params),
  });
}

/** Scan the docs/ folder for new files */
export function useScanDocuments() {
  const queryClient = useQueryClient();

  return useMutation<ScanResponse, Error, void>({
    mutationFn: scanDocuments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}
