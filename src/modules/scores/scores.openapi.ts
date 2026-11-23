export const scoresOpenApi = {
  "/api/scores": {
    post: {
      summary: "Submit jawaban ujian (server menghitung ulang skor & simpan dengan RLS)",
      tags: ["Scores"],
      security: [{ supabaseAuthCookie: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["packageId", "clientAttemptId", "answers", "durationSeconds"],
              properties: {
                packageId: { type: "string", format: "uuid" },
                clientAttemptId: { type: "string", format: "uuid" },
                answers: {
                  type: "object",
                  additionalProperties: { type: "string" },
                  description: "Mapping questionId (UUID) -> option.id stabil (bukan label A-E)",
                },
                durationSeconds: { type: "integer", minimum: 0 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Skor berhasil diverifikasi dan disimpan." },
        200: { description: "Percobaan dengan clientAttemptId ini sudah tersimpan (idempotent)." },
        400: { description: "Payload tidak valid." },
        401: { description: "Pengguna belum login." },
        404: { description: "Paket ujian tidak ditemukan." },
      },
    },
  },
  "/api/scores/me": {
    get: {
      summary: "Ambil riwayat skor tryout pribadi user yang sedang login",
      tags: ["Scores"],
      security: [{ supabaseAuthCookie: [] }],
      responses: {
        200: { description: "Riwayat skor pribadi berhasil diambil." },
        401: { description: "Pengguna belum login." },
      },
    },
  },
  "/api/leaderboard": {
    get: {
      summary: "Ambil papan peringkat paket terurut sesuai aturan tie-breaker BKN",
      tags: ["Leaderboard"],
      parameters: [
        { name: "packageId", in: "query", required: true, schema: { type: "string", format: "uuid" } },
        { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50 } },
      ],
      responses: {
        200: { description: "Daftar papan peringkat berhasil diambil." },
        400: { description: "Parameter packageId tidak valid." },
        404: { description: "Paket ujian tidak ditemukan." },
      },
    },
  },
} as const;
