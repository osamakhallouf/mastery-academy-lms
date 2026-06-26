import { Chapter, Course } from "@prisma/client";

import { CourseMobileSidebar } from "./course-mobile-sidebar";
import { NavbarRoutes } from "@/components/navbar-routes";
import { RiWhatsappFill } from "react-icons/ri";

interface CourseNavbarProps {
  course: Course & {
    chapters: Chapter[];
  };
}

export const CourseNavbar = ({ course }: CourseNavbarProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      <CourseMobileSidebar course={course} />
        <div className="ms-auto flex items-center gap-4">
          <a
            href="https://wa.me/971557028756"
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            aria-label="WhatsApp Contact"
            rel="noreferrer"
            target="_blank"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-600">
              <RiWhatsappFill className="h-4 w-4" />
            </span>
            <span dir="ltr">+971557028756</span>
          </a>
          <NavbarRoutes />
        </div>
    </div>
  );
};