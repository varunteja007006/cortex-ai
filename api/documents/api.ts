import apiClient from "@/api/client";
import type { Document, DocumentsResponse, ScanResponse } from "./types";

/** Fetch all tracked documents */
export async function getDocuments(): Promise<Document[]> {
  const { data } = await apiClient.get<DocumentsResponse>("/documents");
  return data.documents;
}

/** Scan the docs/ folder for new files */
export async function scanDocuments(): Promise<ScanResponse> {
  const { data } = await apiClient.get<ScanResponse>("/scan-docs");
  return data;
}
