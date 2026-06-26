"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { Preview } from "@/components/preview";

type ChapterItem = {
  id: string;
  title: string;
  description?: string | null;
};

interface CourseDetailsTabsProps {
  description?: string | null;
  learningPoints: string[];
  targetAudience: string[];
  chapters: ChapterItem[];
}

const TAB_ABOUT = "about";
const TAB_AUDIENCE = "audience";
const TAB_OBJECTIVES = "objectives";
const TAB_OUTLINE = "outline";

export const CourseDetailsTabs = ({
  description,
  learningPoints,
  targetAudience,
  chapters,
}: CourseDetailsTabsProps) => {
  const t = useTranslations("course");
  const visibleTabs = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    const hasAbout =
      typeof description === "string" && description.trim().length > 0;
    if (hasAbout) list.push({ id: TAB_ABOUT, label: t("tabCourseOverview") });
    if (targetAudience.length > 0)
      list.push({ id: TAB_AUDIENCE, label: t("tabTargetAudience") });
    if (learningPoints.length > 0)
      list.push({ id: TAB_OBJECTIVES, label: t("tabLearningObjectives") });
    if (chapters.length > 0)
      list.push({ id: TAB_OUTLINE, label: t("tabDetailedOutline") });
    return list;
  }, [description, targetAudience.length, learningPoints.length, chapters.length, t]);

  const defaultTab = visibleTabs[0]?.id ?? TAB_ABOUT;
  const [activeTab, setActiveTab] = useState(defaultTab);

  const hasOutlineTab = visibleTabs.some((t) => t.id === TAB_OUTLINE);

  useEffect(() => {
    const syncTabToHash = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const match = hash.match(/^#chapter-(.+)$/);
      if (match && hasOutlineTab) setActiveTab(TAB_OUTLINE);
    };
    syncTabToHash();
    window.addEventListener("hashchange", syncTabToHash);
    return () => window.removeEventListener("hashchange", syncTabToHash);
  }, [hasOutlineTab]);

  const scrollToChapter = (chapterId: string) => {
    const el = document.getElementById(`chapter-${chapterId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    const details = el?.querySelector("details");
    if (details && !details.open) details.open = true;
  };

  useEffect(() => {
    if (activeTab !== TAB_OUTLINE) return;
    const hash = window.location.hash;
    const match = hash.match(/^#chapter-(.+)$/);
    if (!match) return;
    const id = match[1];
    const t = setTimeout(() => scrollToChapter(id), 100);
    const onHashChange = () => {
      const m = window.location.hash.match(/^#chapter-(.+)$/);
      if (m) scrollToChapter(m[1]);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [activeTab]);

  if (visibleTabs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 md:p-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("detailsAvailableSoon")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 md:p-8">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 text-sm rounded-full transition whitespace-nowrap",
              activeTab === tab.id
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 md:hidden">{t("swipeTabs")}</p>

      {activeTab === TAB_ABOUT && (
        <div className="pt-6 space-y-6">
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            <Preview value={description ?? ""} />
          </div>
        </div>
      )}

      {activeTab === TAB_AUDIENCE && (
        <div className="pt-6 space-y-4">
          <ul className="space-y-3">
            {targetAudience.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#1e293b] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === TAB_OBJECTIVES && (
        <div className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Learning Objectives
          </h3>
          <ul className="space-y-2">
            {learningPoints.map((point, index) => (
              <li
                key={`${point}-${index}`}
                className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === TAB_OUTLINE && (
        <div className="pt-6 space-y-4">
          {chapters.map((chapter, index) => (
            <details
              key={chapter.id}
              id={`chapter-${chapter.id}`}
              className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4"
            >
              <summary className="flex cursor-pointer items-center gap-3 list-none">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium shrink-0">
                  {index + 1}
                </span>
                <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {chapter.title}
                </span>
              </summary>
              {chapter.description && (
                <p className="mt-3 ml-11 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {chapter.description}
                </p>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  );
};
