"use client";

import { SignUp } from "@clerk/nextjs";
import { useLocale } from "next-intl";

export default function Page() {
  const locale = useLocale();
  return (
    <SignUp
      forceRedirectUrl={locale ? `/${locale}` : undefined}
      fallbackRedirectUrl={locale ? `/${locale}` : undefined}
      signInFallbackRedirectUrl={locale ? `/${locale}/sign-in` : undefined}
    />
  );
}