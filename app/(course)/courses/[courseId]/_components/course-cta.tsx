"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
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

interface CourseCtaProps {
  courseId: string;
  courseTitle: string;
}

export const CourseCta = ({ courseId, courseTitle }: CourseCtaProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employeesCount, setEmployeesCount] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const brochureUrl = useMemo(
    () => `/api/courses/${courseId}/brochure`,
    [courseId]
  );

  const resetForm = () => {
    setName("");
    setEmail("");
    setCompanyName("");
    setEmployeesCount("");
    setLocation("");
    setPhone("");
    setMessage("");
  };

  const resetLeadForm = () => {
    setLeadName("");
    setLeadPhone("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          companyName,
          employeesCount,
          location,
          phone,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      setSubmitted(true);
      resetForm();
      toast.success(
        data?.message ||
          "Thank you! Our corporate consultant will contact you at +971557028756 soon."
      );
    } catch {
      toast.error("Unable to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#1e293b] text-white hover:bg-[#0f172a]">
            Request Enterprise Proposal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Enterprise Proposal</DialogTitle>
            <DialogDescription>
              Share your company details and we will respond within one business day.
            </DialogDescription>
          </DialogHeader>
          {submitted ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Thank you! Our corporate consultant will contact you at +971557028756 soon.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              required
            />
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Work email"
              type="email"
              required
            />
            <Input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Company name"
              required
            />
            <Input
              value={employeesCount}
              onChange={(event) => setEmployeesCount(event.target.value)}
              placeholder="Number of employees"
              type="number"
              min="1"
              required
            />
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Primary training location"
              required
            />
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone number"
              type="tel"
              required
            />
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Training goals or priorities"
            />
            <Button
              type="submit"
              className="w-full bg-[#d4af37] text-slate-900 hover:bg-[#c89f2f]"
              disabled={isSubmitting}
            >
              Submit Request
            </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-slate-300">
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            Download PDF Brochure
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download PDF Brochure</DialogTitle>
            <DialogDescription>
              Enter your name and phone number to start the download.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setLeadSubmitting(true);
              try {
                const response = await fetch(brochureUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: leadName,
                    phone: leadPhone,
                  }),
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  console.error("Brochure lead error:", errorText);
                  throw new Error(errorText);
                }

                const data = await response.json();
                const downloadLink = data?.downloadUrl || brochureUrl;
                const whatsappLink = data?.whatsappLink as string | undefined;
                const anchor = document.createElement("a");
                anchor.href = downloadLink;
                anchor.click();
                if (whatsappLink) {
                  window.open(whatsappLink, "_blank", "noopener,noreferrer");
                }
                toast.success("Your brochure download is starting.");
                resetLeadForm();
              } catch (error) {
                console.error("Brochure lead submit failed:", error);
                toast.error("Unable to download the brochure. Please try again.");
              } finally {
                setLeadSubmitting(false);
              }
            }}
            className="space-y-3"
          >
            <Input
              value={leadName}
              onChange={(event) => setLeadName(event.target.value)}
              placeholder="Full name"
              required
            />
            <Input
              value={leadPhone}
              onChange={(event) => setLeadPhone(event.target.value)}
              placeholder="Phone number"
              type="tel"
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#1e293b] text-white hover:bg-[#0f172a]"
              disabled={leadSubmitting}
            >
              Start Download
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
