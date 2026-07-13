import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allDocuments = await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));

    return NextResponse.json({ documents: allDocuments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
