"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FileDown } from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CORPORATE_HASH = "#corporate-request";

interface CourseCtaProps {
  courseId: string;
  courseTitle: string;
}

export const CourseCta = ({ courseId, courseTitle }: CourseCtaProps) => {
  const t = useTranslations("course");
  const [corporateOpen, setCorporateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employeesCount, setEmployeesCount] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [brochureOpen, setBrochureOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const isValidBrochureName = (n: string) => {
    const t = n.trim();
    if (t.length < 2 || t.length > 100) return false;
    const letters = t.match(/[A-Za-z\u0600-\u06FF\u0750-\u077F]/g);
    return (letters?.length ?? 0) >= 2;
  };

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === CORPORATE_HASH) {
        setCorporateOpen(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const handleCorporateOpenChange = (open: boolean) => {
    setCorporateOpen(open);
    if (!open && typeof window !== "undefined" && window.location.hash === CORPORATE_HASH) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompanyName("");
    setEmployeesCount("");
    setLocation("");
    setPhone("");
    setMessage("");
  };

  const onSubmitCorporate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCompany = companyName.trim();
    const trimmedEmployees = employeesCount.trim();
    if (!trimmedCompany) {
      toast.error(t("companyName") + " " + t("required"));
      return;
    }
    if (!trimmedEmployees || !/^\d+$/.test(trimmedEmployees)) {
      toast.error(t("employeesNumbersOnly"));
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/corporate-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          courseTitle,
          name,
          email,
          companyName: trimmedCompany,
          employeesCount: trimmedEmployees,
          location,
          phone,
          message,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setSubmitted(true);
      resetForm();
      toast.success(data?.message || t("toastRequestSuccess"));
    } catch {
      toast.error(t("toastRequestError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBrochureSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = leadName.trim();
    const trimmedEmail = leadEmail.trim();
    const trimmedPhone = leadPhone.trim();
    if (!isValidBrochureName(trimmedName)) {
      toast.error(t("brochureInvalidName"));
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      toast.error(t("brochureInvalidEmail"));
      return;
    }
    if (!trimmedPhone) {
      toast.error(t("phoneNumber") + " " + t("required"));
      return;
    }
    setLeadSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/brochure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (data?.error ?? data?.message ?? response.statusText) || "Request failed"
        );
      }
      toast.success(data?.message || t("toastBrochureSentToEmail"));
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setBrochureOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("toastBrochureError")
      );
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="space-y-3" id="corporate-request">
      <Dialog open={corporateOpen} onOpenChange={handleCorporateOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#1e293b] text-white hover:bg-[#0f172a] py-6 text-base font-medium">
            {t("corporateTrainingRequest")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("requestTitle")}</DialogTitle>
            <DialogDescription>
              {t("requestDescription")}
            </DialogDescription>
          </DialogHeader>
          {submitted ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300">
              {t("thankYouContact")}
            </div>
          ) : (
            <form onSubmit={onSubmitCorporate} className="space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fullName")}
                required
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("workEmail")}
                type="email"
                required
              />
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("companyName")}
                required
              />
              <Input
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value.replace(/\D/g, ""))}
                placeholder={t("numberOfEmployees")}
                inputMode="numeric"
                pattern="[0-9]*"
                required
              />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("primaryTrainingLocation")}
                required
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phoneNumber")}
                type="tel"
                required
              />
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("customizationRequestsPlaceholder")}
              />
              <Button
                type="submit"
                className="w-full bg-[#d4af37] text-slate-900 hover:bg-[#c89f2f]"
                disabled={isSubmitting}
              >
                {t("submitRequest")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={brochureOpen} onOpenChange={setBrochureOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-slate-300 dark:border-slate-600 font-medium">
            <FileDown className="mr-2 h-4 w-4 text-red-600 shrink-0" aria-hidden />
            {t("downloadPdfBrochure")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("brochureTitle")}</DialogTitle>
            <DialogDescription>
              {t("brochureDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onBrochureSubmit} className="space-y-3">
            <Input
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder={t("fullName")}
              required
            />
            <Input
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder={t("workEmail")}
              type="email"
              required
            />
            <Input
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              placeholder={t("phoneNumber")}
              type="tel"
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#1e293b] text-white hover:bg-[#0f172a]"
              disabled={leadSubmitting}
            >
              {leadSubmitting ? t("preparing") : t("sendBrochure")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
