"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Category = { id: string; name: string };
type MonthOption = { value: string; label: string };

interface HomeFilterBarProps {
  categories: Category[];
  cities: string[];
  months: MonthOption[];
}

export function HomeFilterBar({ categories, cities, months }: HomeFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId") ?? "";
  const city = searchParams.get("city") ?? "";
  const month = searchParams.get("month") ?? "";

  const apply = useCallback(
    (updates: { categoryId?: string; city?: string; month?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.categoryId !== undefined) {
        if (updates.categoryId) params.set("categoryId", updates.categoryId);
        else params.delete("categoryId");
      }
      if (updates.city !== undefined) {
        if (updates.city) params.set("city", updates.city);
        else params.delete("city");
      }
      if (updates.month !== undefined) {
        if (updates.month) params.set("month", updates.month);
        else params.delete("month");
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="rounded-xl border-2 border-[#1e293b]/15 bg-white shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#1e293b] mb-1.5">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => apply({ categoryId: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#1e293b] focus:ring-2 focus:ring-[#1e293b]/20 focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#1e293b] mb-1.5">
            Month
          </label>
          <select
            value={month}
            onChange={(e) => apply({ month: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#1e293b] focus:ring-2 focus:ring-[#1e293b]/20 focus:outline-none"
          >
            <option value="">All months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#1e293b] mb-1.5">
            City
          </label>
          <select
            value={city}
            onChange={(e) => apply({ city: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#1e293b] focus:ring-2 focus:ring-[#1e293b]/20 focus:outline-none"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
