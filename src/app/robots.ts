import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/exam/",
          "/result/",
          "/history",
          "/profile",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
