"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ConfirmationFormProps = {
  inquiryId: string;
  defaultParticipants: string[];
  defaultLocation: string;
  defaultTime: string;
  defaultCourseDate: string;
  defaultTotalFees: string;
};

export const ConfirmationForm = ({
  inquiryId,
  defaultParticipants,
  defaultLocation,
  defaultTime,
  defaultCourseDate,
  defaultTotalFees,
}: ConfirmationFormProps) => {
  const [participants, setParticipants] = useState(
    defaultParticipants.join("\n")
  );
  const [location, setLocation] = useState(defaultLocation);
  const [time, setTime] = useState(defaultTime);
  const [courseDate, setCourseDate] = useState(defaultCourseDate);
  const [totalFees, setTotalFees] = useState(defaultTotalFees);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/corporate-inquiries/${inquiryId}/confirmation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participants,
            location,
            time,
            courseDate,
            totalFees,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      toast.success("Confirmation Letter sent successfully to the company");
    } catch {
      toast.error("Unable to create confirmation letter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea
        value={participants}
        onChange={(event) => setParticipants(event.target.value)}
        placeholder="Participants (one name per line)"
        className="min-h-[140px]"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Training location"
          required
        />
        <Input
          value={time}
          onChange={(event) => setTime(event.target.value)}
          placeholder="Time (e.g., 9:00 AM - 3:00 PM)"
          required
        />
        <Input
          value={courseDate}
          onChange={(event) => setCourseDate(event.target.value)}
          type="date"
          required
        />
        <Input
          value={totalFees}
          onChange={(event) => setTotalFees(event.target.value)}
          placeholder="Total fees (e.g., AED 120,000)"
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          className="bg-[#1e293b] text-white hover:bg-[#0f172a]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating..." : "Create Confirmation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            window.open(
              `/api/corporate-inquiries/${inquiryId}/confirmation`,
              "_blank"
            )
          }
        >
          Download PDF
        </Button>
      </div>
    </form>
  );
};
