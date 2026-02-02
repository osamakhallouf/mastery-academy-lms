import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";

export const Logo = () => {
  return (
    <Link
      href="/"
      aria-label="Mastery Academy Home"
      className="flex items-center gap-2"
    >
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
        <GraduationCap className="h-5 w-5 text-amber-500" />
        <BookOpen className="absolute -bottom-1 -right-1 h-4 w-4 text-amber-500" />
      </span>
      <span className="text-base font-bold tracking-tight text-slate-900">
        Mastery Academy
      </span>
    </Link>
  );
};