"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { Logo } from "@/app/[locale]/(dashboard)/_components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function Page() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded) return;

    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/post-auth");
        return;
      }

      toast.error("Invalid credentials");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center px-4 py-10 pb-24">
      <div className="w-full md:max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <Logo />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Sign in to Mastery Academy
            </h1>
            <p className="text-sm text-slate-500">
              Secure access for corporate administrators.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Work email"
            type="email"
            required
          />
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            required
          />
          <Button
            type="submit"
            className="w-full bg-[#1e293b] text-white hover:bg-[#0f172a]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a
            href={`https://wa.me/971557028756?text=${encodeURIComponent(
              "Hello Mastery Academy, I need support with corporate login."
            )}`}
            className="text-xs text-slate-500 hover:text-slate-700"
            target="_blank"
            rel="noreferrer"
          >
            Having trouble? Contact Support
          </a>
        </div>
      </div>
      <WhatsAppFloat message="Hello Mastery Academy, I need support with corporate login." />
    </div>
  );
}