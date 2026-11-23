import { SQL } from "bun";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL tidak ditemukan di environment (.env.local).");
  process.exit(1);
}

const sql = new SQL(databaseUrl);

try {
  console.log("Menjalankan migrasi: supabase/migrations/001_init_schema.sql ...");
  await sql.file("supabase/migrations/001_init_schema.sql");
  console.log("Migrasi selesai.");

  console.log("Menjalankan seed: supabase/seed.sql ...");
  await sql.file("supabase/seed.sql");
  console.log("Seed selesai.");

  const pkgCount = await sql`select count(*)::int as total from public.exam_packages`;
  const qCount = await sql`select count(*)::int as total from public.questions`;
  console.log(`Verifikasi DB: exam_packages=${pkgCount[0]?.total ?? 0}, questions=${qCount[0]?.total ?? 0}`);
} finally {
  await sql.close();
}
