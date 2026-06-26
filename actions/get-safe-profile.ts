import { SafeProfile } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export default async function getSafeProfile(): Promise<SafeProfile | null> {
  try {
    const { userId } = auth();

    if (!userId) {
      const locale = await getLocale();
      return redirect({ href: "/", locale });
    }

    const user = await currentUser();
    if (!user) {
      return null;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
    const email = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null;

    const safeProfile: SafeProfile = {
      id: user.id,
      userId: user.id,
      name,
      imageUrl: user.imageUrl ?? null,
      email,
      role: null,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt ?? user.createdAt).toISOString(),
    };

    return safeProfile;
  } catch {
    return null;
  }
}
