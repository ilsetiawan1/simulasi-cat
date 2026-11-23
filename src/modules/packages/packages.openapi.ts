export const packagesOpenApi = {
  "/api/packages": {
    get: {
      summary: "Ambil daftar paket ujian aktif",
      tags: ["Packages"],
      parameters: [
        {
          name: "category",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["SKD_FULL", "MINI_TWK", "MINI_TIU", "MINI_TKP", "SKB"],
          },
        },
      ],
      responses: {
        200: { description: "Daftar paket ujian aktif berhasil diambil." },
        400: { description: "Parameter category tidak valid." },
      },
    },
  },
} as const;
