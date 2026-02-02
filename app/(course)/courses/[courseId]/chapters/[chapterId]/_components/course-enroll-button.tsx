"use client";

import { Button } from "@/components/ui/button";

interface CourseEnrollButtonProps {
  courseTitle: string;
  label?: string;
  className?: string;
}

export const CourseEnrollButton = ({
  courseTitle,
  label,
  className,
}: CourseEnrollButtonProps) => {
  const onClick = () => {
    const whatsappLink = `https://wa.me/971557028756?text=${encodeURIComponent(
      `I'm interested in corporate training for ${courseTitle}`
    )}`;
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Button
        onClick={onClick}
        size="sm"
        className={className ?? "w-full md:w-auto bg-[#1e293b] text-white hover:bg-[#0f172a]"}
      >
        {label ?? "Request Enterprise Proposal"}
      </Button>
    </div>
  );
};
