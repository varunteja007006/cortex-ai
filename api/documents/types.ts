/** A document tracked in the system */
export type Document = {
  id: string;
  filename: string;
  filepath: string;
  fileHash: string;
  ingested: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Result of scanning a single file */
export type ScanResult = {
  filename: string;
  filepath: string;
  fileHash: string;
  ingested: boolean;
  status: "new" | "existing" | "unchanged";
};

/** Successful scan response */
export type ScanSuccessResponse = {
  success: true;
  scanned: number;
  results: ScanResult[];
};

/** Failed scan response */
export type ScanErrorResponse = {
  success: false;
  error: string;
};

/** Union type for scan endpoint response */
export type ScanResponse = ScanSuccessResponse | ScanErrorResponse;

/** Response from GET /api/documents */
export type DocumentsResponse = {
  documents: Document[];
};
