"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

const locales = [
  { code: "en", label: "EN" },
  { code: "ar", label: "العربية" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 p-0.5">
      {locales.map(({ code, label }) => (
        <Button
          key={code}
          variant="ghost"
          size="sm"
          className={`min-w-[2.25rem] text-xs font-medium ${
            locale === code
              ? "bg-[#d4af37] text-[#1e293b] hover:bg-[#c89f2f] hover:text-[#1e293b]"
              : "text-white hover:bg-white/10"
          }`}
          onClick={() => switchLocale(code)}
          disabled={isPending}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
