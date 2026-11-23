import type { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/middlewares/error-handler";
import { jsonOk } from "@/utils/http-response";
import { listActivePackages } from "./packages.service";

const listPackagesQuerySchema = z.object({
  category: z.enum(["SKD_FULL", "MINI_TWK", "MINI_TIU", "MINI_TKP", "SKB"]).optional(),
});

export async function handleGetPackages(request: NextRequest) {
  return handleApiError(async () => {
    const url = new URL(request.url);
    const rawCategory = url.searchParams.get("category") ?? undefined;
    const { category } = listPackagesQuerySchema.parse({ category: rawCategory });

    const packages = await listActivePackages(category);
    return jsonOk(packages);
  });
}
