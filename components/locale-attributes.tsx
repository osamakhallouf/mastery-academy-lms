"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Sets document dir and lang for RTL/LTR and accessibility. */
export function LocaleAttributes() {
  const locale = useLocale();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", locale);
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  }, [locale]);

  return null;
}
