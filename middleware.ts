import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { routing } from "./i18n/routing";

const authRateLimit = { limit: 10, windowMs: 60_000 };

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  let response: NextResponse | null = null;

  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    response = intlMiddleware(req);
    if (response && response.status >= 300 && response.status < 400) {
      return response;
    }
  }

  const isAuthRoute =
    pathname.includes("/sign-in") || pathname.includes("/sign-up");
  if (isAuthRoute) {
    const ip = req.ip || getClientIpFromHeaders(req.headers);
    const rate = await rateLimit(`auth:${ip}`, authRateLimit);
    if (!rate.success) {
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
      });
    }
  }

  return response ?? NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
