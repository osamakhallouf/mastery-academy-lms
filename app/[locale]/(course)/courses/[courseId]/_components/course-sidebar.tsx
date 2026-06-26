import { auth } from "@clerk/nextjs/server";
import { Chapter, Course } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSidebarProps {
  course: Course & {
    chapters: Chapter[];
  };
}

export const CourseSidebar = async ({ course }: CourseSidebarProps) => {
  const locale = await getLocale();
  const { userId } = auth();

  if (!userId) {
    return redirect({ href: "/", locale });
  }

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">{course.title}</h1>
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            courseId={course.id}
          />
        ))}
      </div>
    </div>
  );
};