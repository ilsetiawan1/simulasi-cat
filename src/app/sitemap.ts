import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/aturan-bkn`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return staticRoutes;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("exam_packages")
      .select("slug, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error || !data) {
      return staticRoutes;
    }

    const packageRoutes: MetadataRoute.Sitemap = data
      .filter((item): item is { slug: string; created_at: string } => typeof item.slug === "string")
      .map((pkg) => ({
        url: `${siteUrl}/packages/${pkg.slug}`,
        lastModified: pkg.created_at ? new Date(pkg.created_at) : now,
        changeFrequency: "weekly",
        priority: 0.9,
      }));

    return [...staticRoutes, ...packageRoutes];
  } catch {
    return staticRoutes;
  }
}
