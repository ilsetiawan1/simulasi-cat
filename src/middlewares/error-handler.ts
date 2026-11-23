import type { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, jsonError } from "@/utils/http-response";

export async function handleApiError(
  action: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const message = firstIssue?.message ?? "Format data tidak valid.";
      return jsonError(400, "VALIDATION_ERROR", message);
    }

    if (error instanceof AppError) {
      return jsonError(error.status, error.code, error.message);
    }

    // Jangan pernah mengekspos stack trace atau detail error PostgreSQL ke client
    return jsonError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
    );
  }
}
