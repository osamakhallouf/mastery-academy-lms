"use client";

import { format } from "date-fns";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { TeacherBookingRow } from "@/actions/get-teacher-bookings";

interface BookingsTableProps {
  bookings: TeacherBookingRow[];
  userNames: Record<string, string>;
}

export const BookingsTable = ({ bookings, userNames }: BookingsTableProps) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleStatus = async (bookingId: string, status: "approved" | "rejected") => {
    setUpdatingId(bookingId);
    try {
      await axios.patch(`/api/bookings/${bookingId}`, { status });
      toast.success(status === "approved" ? "Booking approved" : "Booking rejected");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Run (Date / Location)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">
                {userNames[b.userId] ?? b.userId}
              </TableCell>
              <TableCell>{b.course.title}</TableCell>
              <TableCell>
                <span className="text-slate-600">
                  {format(new Date(b.courseRun.startDate), "dd MMM yyyy")}
                  {b.courseRun.endDate
                    ? ` – ${format(new Date(b.courseRun.endDate), "dd MMM yyyy")}`
                    : ""}
                </span>
                {b.courseRun.location && (
                  <span className="block text-sm text-slate-500">
                    {b.courseRun.location}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    b.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : b.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {b.status === "pending" && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      disabled={updatingId === b.id}
                      onClick={() => handleStatus(b.id, "rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={updatingId === b.id}
                      onClick={() => handleStatus(b.id, "approved")}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
