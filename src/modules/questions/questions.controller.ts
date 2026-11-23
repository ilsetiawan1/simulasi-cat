import { z } from "zod";
import { handleApiError } from "@/middlewares/error-handler";
import { jsonOk } from "@/utils/http-response";
import { getQuestionsByPackageSlug } from "./questions.service";

const slugParamSchema = z.object({
  slug: z.string().trim().min(1, "Slug paket ujian wajib diisi.").max(100),
});

export async function handleGetPackageQuestions(rawSlug: string) {
  return handleApiError(async () => {
    const { slug } = slugParamSchema.parse({ slug: rawSlug });
    const payload = await getQuestionsByPackageSlug(slug);
    return jsonOk(payload);
  });
}
