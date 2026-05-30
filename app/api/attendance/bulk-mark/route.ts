import { NextRequest, NextResponse } from "next/server";
import { protectedRoute } from "@/lib/api-middleware";
import { db } from "@/lib/firebase-admin";

/**
 * POST /api/attendance/bulk-mark
 * Bulk mark attendance for multiple workers
 * Requires: admin authentication
 */
async function handler(request: NextRequest, user: any) {
  try {
    const { records } = await request.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Invalid attendance records" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    records.forEach((record) => {
      if (record.workerId && record.date) {
        const attendanceId = `${record.workerId}_${record.date}`;
        updates[`/attendance/${attendanceId}`] = {
          workerId: record.workerId,
          date: record.date,
          status: record.status || "present",
          checkIn: record.checkIn || null,
          checkOut: record.checkOut || null,
          hours: record.hours || 0,
          notes: record.notes || "",
          createdAt: record.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    });

    await db.ref().update(updates);

    return NextResponse.json({
      success: true,
      message: `Marked attendance for ${records.length} records`,
      count: records.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const POST = protectedRoute(handler);
