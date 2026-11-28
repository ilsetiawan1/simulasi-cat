import { describe, expect, test } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import { listActivePackages } from "../packages.service";
import { getQuestionsByPackageSlug } from "@/modules/questions/questions.service";
import { getPackageLeaderboard } from "@/modules/scores/scores.service";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe("Supabase integration (packages, questions, leaderboard)", () => {
  test("mengambil paket aktif, soal dalam 1x request, dan leaderboard", async () => {
    if (!url || !anonKey) {
      return;
    }

    const client = createClient(url, anonKey);
    const packages = await listActivePackages(undefined, client);
    expect(packages.length).toBeGreaterThanOrEqual(5);

    const skd = packages.find((p) => p.slug === "skd-penuh-01");
    expect(skd).toBeDefined();

    const payload = await getQuestionsByPackageSlug("skd-penuh-01", client);
    expect(payload.package.id).toBe(skd!.id);
    expect(payload.questions.length).toBeGreaterThanOrEqual(9);
    expect(
      payload.questions.every(
        (q) => typeof q.shuffle_options === "boolean" && q.options.length >= 2,
      ),
    ).toBe(true);

    const leaderboard = await getPackageLeaderboard(skd!.id, 20, client);
    expect(Array.isArray(leaderboard)).toBe(true);
  });
});
