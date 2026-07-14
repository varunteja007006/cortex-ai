"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getDocuments, scanDocuments } from "./api";
import type { Document, ScanResponse } from "./types";

/** Query key factory for documents domain */
export const documentKeys = {
  all: ["documents"] as const,
};

/** Fetch all tracked documents */
export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: documentKeys.all,
    queryFn: getDocuments,
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
