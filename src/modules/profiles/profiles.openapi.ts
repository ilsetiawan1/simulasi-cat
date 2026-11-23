export const profilesOpenApi = {
  "/api/profile": {
    get: {
      summary: "Ambil profil pengguna yang sedang login",
      tags: ["Profiles"],
      security: [{ supabaseAuthCookie: [] }],
      responses: {
        200: { description: "Profil pengguna berhasil diambil." },
        401: { description: "Pengguna belum login." },
      },
    },
    patch: {
      summary: "Perbarui nama tampilan (display_name) dan/atau avatar (avatar_url) profil sendiri",
      tags: ["Profiles"],
      security: [{ supabaseAuthCookie: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                displayName: { type: "string", minLength: 2, maxLength: 60 },
                avatarUrl: { type: "string", nullable: true, maxLength: 512 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Profil berhasil diperbarui." },
        400: { description: "Payload profil tidak valid." },
        401: { description: "Pengguna belum login." },
      },
    },
  },
} as const;
