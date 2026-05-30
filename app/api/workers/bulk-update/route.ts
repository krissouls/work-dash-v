import { NextRequest, NextResponse } from "next/server";
import { protectedRoute } from "@/lib/api-middleware";
import { db } from "@/lib/firebase-admin";

/**
 * POST /api/workers/bulk-update
 * Bulk update worker details (e.g., salary, status)
 * Requires: admin authentication
 */
async function handler(request: NextRequest, user: any) {
  try {
    const { workers } = await request.json();

    if (!Array.isArray(workers) || workers.length === 0) {
      return NextResponse.json(
        { error: "Invalid workers array" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    workers.forEach((worker) => {
      if (worker.id) {
        updates[`/workers/${worker.id}`] = {
          ...worker,
          updatedAt: new Date().toISOString(),
        };
      }
    });

    await db.ref().update(updates);

    return NextResponse.json({
      success: true,
      message: `Updated ${workers.length} workers`,
      count: workers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = protectedRoute(handler);
