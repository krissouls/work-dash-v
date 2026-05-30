import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

/**
 * Verify Firebase ID token and extract user claims
 * Used to protect API routes that need server-side verification
 */
export async function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null, error: "Missing authorization header" };
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    return { user: decodedToken, error: null };
  } catch (error) {
    return {
      user: null,
      error: `Token verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Create protected API response
 */
export function protectedRoute(handler: Function) {
  return async (request: NextRequest) => {
    const { user, error } = await verifyToken(request);

    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    return handler(request, user);
  };
}
