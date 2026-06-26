import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { db } from "@/lib/db";

import { CourseSidebar } from "./_components/course-sidebar";
import { CourseNavbar } from "./_components/course-navbar";

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const locale = await getLocale();
  const { userId } = auth();

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      isPublished: true,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      },
    },
  });

  if (!course) {
    return redirect({ href: "/", locale });
  }

  if (userId) {
    return (
      <div className="h-full">
        <div className="h-[80px] md:ps-80 fixed inset-y-0 w-full z-50">
          <CourseNavbar course={course} />
        </div>
        <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 start-0 z-50">
          <CourseSidebar course={course} />
        </div>
        <main className="md:ps-80 pt-[80px] h-full">
          {children}
        </main>
      </div>
    );
  }

  // Public layout without sidebar/navbar
  return (
    <div className="h-full">
      <main className="h-full">
        {children}
      </main>
    </div>
  );
}

export default CourseLayout;