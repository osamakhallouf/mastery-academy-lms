import Link from "next/link";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";

import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadgeSelect } from "./_components/status-badge-select-fixed";

/** Build WhatsApp Web link: wa.me/<digits only>. */
function whatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("0") ? `971${digits.slice(1)}` : digits;
  return `https://wa.me/${number}`;
}

const CorporateInquiriesPage = async () => {
  const inquiries = await db.corporateInquiry.findMany({
    include: {
      course: true,
      confirmationLetter: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Corporate Inquiries
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review requests and issue confirmation letters. Click phone to open WhatsApp.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Work Email</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Course</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow
                key={inquiry.id}
                className="border-slate-200 dark:border-slate-700"
              >
                <TableCell className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {format(inquiry.createdAt, "dd MMM yyyy")}
                </TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                  {inquiry.companyName}
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  {inquiry.name}
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {inquiry.email}
                  </a>
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  <a
                    href={whatsAppLink(inquiry.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:underline font-medium"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span dir="ltr">{inquiry.phone}</span>
                  </a>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {inquiry.course?.title ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadgeSelect
                    inquiryId={inquiry.id}
                    initialStatus={inquiry.status}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/teacher/corporate-inquiries/${inquiry.id}/confirmation`}
                  >
                    <Button variant="outline" size="sm">
                      {inquiry.confirmationLetter
                        ? "View Confirmation"
                        : "Create Confirmation"}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {inquiries.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No corporate inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateInquiriesPage;
