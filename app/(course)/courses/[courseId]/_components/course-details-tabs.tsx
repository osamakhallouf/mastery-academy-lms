"use client";

import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";

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

const tabs = [
  { id: "about", label: "Course Overview" },
  { id: "audience", label: "Target Audience" },
  { id: "objectives", label: "Learning Objectives" },
  { id: "outline", label: "Detailed Outline" },
];

export const CourseDetailsTabs = ({
  description,
  learningPoints,
  targetAudience,
  chapters,
}: CourseDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 md:p-8">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 overflow-x-auto">
        {tabs.map((tab) => (
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
      <p className="mt-2 text-xs text-slate-500 md:hidden">
        Swipe to view all tabs
      </p>

      {activeTab === "about" && (
        <div className="pt-6 space-y-6">
          {description && (
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              <Preview value={description} />
            </div>
          )}
          {!description && (
            <p className="text-sm text-slate-500">
              The course overview will be updated shortly.
            </p>
          )}
        </div>
      )}

      {activeTab === "audience" && (
        <div className="pt-6 space-y-4">
          <ul className="space-y-2">
            {targetAudience.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[#1e293b]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "objectives" && (
        <div className="pt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Learning Objectives
            </h3>
            <ul className="space-y-2">
              {learningPoints.map((point, index) => (
                <li key={`${point}-${index}`} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
              {learningPoints.length === 0 && (
                <li className="text-sm text-slate-500">Objectives will be shared upon request.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "outline" && (
        <div className="pt-6 space-y-4">
          {chapters.map((chapter, index) => (
            <details
              key={chapter.id}
              className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-sm">
                    {index + 1}
                  </span>
                  <span className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {chapter.title}
                  </span>
                </div>
                <Lock className="h-4 w-4 text-slate-500" />
              </summary>
              {chapter.description && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  {chapter.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Lock className="h-3 w-3" />
                <span>Detailed content is shared after confirmation</span>
              </div>
            </details>
          ))}
          {chapters.length === 0 && (
            <p className="text-sm text-slate-500">Outline will be available soon.</p>
          )}
        </div>
      )}
    </div>
  );
};
