import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

/**
 * Chapter pages are not used in B2B (no online video). Any direct access to
 * /courses/[courseId]/chapters/[chapterId] redirects to the course page with
 * the chapter hash so the outline can scroll to that section.
 * Redirect is locale-aware via next-intl.
 */
const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const locale = await getLocale();
  return redirect({
    href: `/courses/${params.courseId}#chapter-${params.chapterId}`,
    locale,
  });
};

export default ChapterIdPage;
