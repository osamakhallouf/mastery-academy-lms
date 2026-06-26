"use client"

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname, Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isTeacher } from "@/lib/teacher";

interface NavbarRoutesProps {
  variant?: "default" | "public";
}

export const NavbarRoutes = ({ variant = "default" }: NavbarRoutesProps) => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const locale = useLocale();
  const tNav = useTranslations("nav");

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isCoursePage = pathname?.includes("/courses");
  const isPublic = variant === "public";

  return (
    <>
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || (isCoursePage && userId) ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              {tNav("exit")}
            </Button>
          </Link>
        ) : isTeacher(userId) ? (
          <Link href="/teacher/courses">
            <Button size="sm" variant="ghost">
              {tNav("teacherMode")}
            </Button>
          </Link>
        ) : null}
        {userId ? (
          <UserButton afterSignOutUrl={locale ? `/${locale}` : "/"} />
        ) : (
          <SignInButton mode="modal" forceRedirectUrl={locale ? `/${locale}` : undefined}>
            <Button
              size="sm"
              variant={isPublic ? "outline" : "ghost"}
              className={
                isPublic
                  ? "border-[#d4af37]/60 text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#f5e6a8]"
                  : undefined
              }
            >
              {tNav("signIn")}
            </Button>
          </SignInButton>
        )}
      </div>
    </>
  );
};