import { NextRequest, NextResponse } from "next/server";
import { protectedRoute } from "@/lib/api-middleware";
import { db } from "@/lib/firebase-admin";

/**
 * POST /api/payments/process
 * Process worker payments and update status
 * Requires: admin authentication
 */
async function handler(request: NextRequest, user: any) {
  try {
    const { paymentIds, status, processedAt } = await request.json();

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid payment IDs" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    paymentIds.forEach((id) => {
      updates[`/payments/${id}`] = {
        status: status || "completed",
        processedAt: processedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    await db.ref().update(updates);

    return NextResponse.json({
      success: true,
      message: `Processed ${paymentIds.length} payments`,
      count: paymentIds.length,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = protectedRoute(handler);
