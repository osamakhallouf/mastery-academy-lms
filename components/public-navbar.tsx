"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { NavbarRoutes } from "./navbar-routes";
import { Logo } from "@/app/(dashboard)/_components/logo";
import { RiWhatsappFill } from "react-icons/ri";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search-input";
import { MobileSearchToggle } from "@/components/mobile-search-toggle";

export const PublicNavbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const showSearch = pathname === "/" || pathname === "/search";

  return (
    <div className="sticky top-0 z-50 p-4 border-b h-full flex items-center bg-[#1e293b] text-white shadow-sm">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center shrink-0">
          <Logo />
        </div>

        {showSearch && (
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-full max-w-md">
              <SearchInput />
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 shrink-0">
          {showSearch && !menuOpen && (
            <div className="md:hidden">
              <MobileSearchToggle />
            </div>
          )}
          {!menuOpen && (
            <a
              href="https://wa.me/971557028756"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[#d4af37] hover:text-[#f0d571]"
              aria-label="WhatsApp Contact"
              rel="noreferrer"
              target="_blank"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                <RiWhatsappFill className="h-4 w-4" />
              </span>
              <span dir="ltr">+971557028756</span>
            </a>
          )}
          <div className={menuOpen ? "hidden md:block" : "block"}>
            <NavbarRoutes variant="public" />
          </div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden border-white/30 text-white hover:bg-white/10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0f172a] text-white">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="text-sm font-medium hover:text-[#d4af37]">
                  Home
                </Link>
                <Link
                  href="/corporate-services"
                  className="text-sm font-medium hover:text-[#d4af37]"
                >
                  Corporate Services
                </Link>
                <a
                  href="https://wa.me/971557028756"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#d4af37]"
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                    <RiWhatsappFill className="h-4 w-4" />
                  </span>
                  <span dir="ltr">+971557028756</span>
                </a>
                <div className="pt-2 border-t border-white/10">
                  <NavbarRoutes variant="public" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
