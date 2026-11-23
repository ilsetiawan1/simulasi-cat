export const questionsOpenApi = {
  "/api/packages/{slug}/questions": {
    get: {
      summary: "Ambil metadata paket beserta seluruh soal dalam 1x request",
      tags: ["Questions"],
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Metadata paket dan seluruh soal berhasil diambil." },
        404: { description: "Paket ujian tidak ditemukan." },
      },
    },
  },
} as const;
