"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";

import { cn } from "@/lib/utils";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  courseId: string;
}

export const CourseSidebarItem = ({
  label,
  id,
  courseId,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentHash, setCurrentHash] = useState("");
  useEffect(() => {
    setCurrentHash(window.location.hash);
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const isOnCoursePage = pathname === `/courses/${courseId}`;
  const isActive = isOnCoursePage && currentHash === `#chapter-${id}`;

  const onClick = () => {
    router.push(`/courses/${courseId}#chapter-${id}`);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-600 dark:text-slate-400 text-sm font-medium pl-6 transition-all hover:text-slate-900 hover:bg-slate-100/80 dark:hover:text-slate-100 dark:hover:bg-slate-800/80",
        isActive &&
          "text-slate-900 bg-slate-100 dark:bg-slate-800 dark:text-slate-100"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <FileText
          size={20}
          className={cn(
            "text-slate-500 dark:text-slate-400 shrink-0",
            isActive && "text-slate-700 dark:text-slate-200"
          )}
        />
        {label}
      </div>
    </button>
  );
};
