import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { isTeacher } from "@/lib/teacher";

/** No caching: always run redirect logic with latest auth state. */
export const dynamic = "force-dynamic";

const PostAuthPage = async () => {
  const locale = await getLocale();
  const { userId } = auth();

  if (!userId) {
    return redirect({ href: "/sign-in", locale });
  }

  if (isTeacher(userId)) {
    return redirect({ href: "/teacher/courses", locale });
  }

  return redirect({ href: "/", locale });
};

export default PostAuthPage;
