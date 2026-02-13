import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

const authRateLimit = {
  limit: 10,
  windowMs: 60_000,
};

export default clerkMiddleware((_auth, req) => {
  const pathname = req.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAuthRoute) {
    const ip = req.ip || getClientIpFromHeaders(req.headers);
    const rate = rateLimit(`auth:${ip}`, authRateLimit);

    if (!rate.success) {
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
      });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};