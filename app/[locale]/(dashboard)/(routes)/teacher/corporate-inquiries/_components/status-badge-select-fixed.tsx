"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type InquiryStatus = "New" | "Contacted" | "Proposal Sent" | "Closed / Won";

const STATUS_OPTIONS: { value: InquiryStatus; label: string; colorClass: string }[] =
  [
    {
      value: "New",
      label: "🔴 New",
      colorClass:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
    {
      value: "Contacted",
      label: "🟡 Contacted",
      colorClass:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      value: "Proposal Sent",
      label: "🔵 Proposal Sent",
      colorClass:
        "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    },
    {
      value: "Closed / Won",
      label: "🟢 Closed / Won",
      colorClass:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];

interface StatusBadgeSelectProps {
  inquiryId: string;
  initialStatus: string | null;
}

export const StatusBadgeSelect = ({
  inquiryId,
  initialStatus,
}: StatusBadgeSelectProps) => {
  const fallback: InquiryStatus = "New";
  const [status, setStatus] = useState<InquiryStatus>(
    (STATUS_OPTIONS.find((opt) => opt.value === initialStatus)?.value ??
      fallback) as InquiryStatus
  );
  const [isPending, startTransition] = useTransition();

  const current =
    STATUS_OPTIONS.find((opt) => opt.value === status) ?? STATUS_OPTIONS[0];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as InquiryStatus;
    setStatus(next);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/corporate-inquiries/${inquiryId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: next }),
          }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Unable to update status");
        }
        toast.success("Status updated");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to update status"
        );
      }
    });
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 bg-opacity-90",
        current.colorClass
      )}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

