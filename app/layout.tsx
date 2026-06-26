import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@uploadthing/react/styles.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";

const inter = Inter({ subsets: ["latin"] });

const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Mastery Academy",
    },
  },
  signUp: {
    start: {
      title: "Create your Mastery Academy account",
    },
  },
};

export const metadata: Metadata = {
  title: "Mastery Academy - Enterprise Training Hub",
  description: "Premium corporate learning programs delivered by certified experts.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      localization={clerkLocalization as never}
      appearance={{
        variables: {
          colorPrimary: "#1e293b",
        },
        elements: {
          formButtonPrimary:
            "bg-[#1e293b] text-white hover:bg-[#0f172a] hover:text-[#d4af37]",
          card: "w-full max-w-none sm:max-w-[420px]",
          cardBox: "w-full",
        },
        layout: {
          logoImageUrl: "/logo.svg",
          logoPlacement: "inside",
        },
      }}
    >
      <html suppressHydrationWarning>
        <body className={inter.className}>
          <ConfettiProvider />
          <ToastProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}