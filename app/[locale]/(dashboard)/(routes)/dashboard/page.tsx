import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { isTeacher } from "@/lib/teacher";

export default async function DashboardPage() {
  const locale = await getLocale();
  const { userId } = auth();

  if (!userId) {
    return redirect({ href: "/", locale });
  }

  if (isTeacher(userId)) {
    return redirect({ href: "/teacher/courses", locale });
  }

  return redirect({ href: "/", locale });
}
