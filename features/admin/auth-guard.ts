import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";

/**
 * Checks that the current session belongs to an admin.
 *
 * Returns a typed failure instead of throwing so server actions can respond
 * with a controlled `{ success: false, error }` object.
 */
export async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    const t = await getTranslations("validation");
    return { success: false as const, error: t("unauthorizedAdmin") };
  }

  return { success: true as const };
}
