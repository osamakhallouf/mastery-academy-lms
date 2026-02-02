import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

type ConfirmationData = {
  companyName: string;
  courseTitle: string;
  courseDate: Date;
  location: string;
  time: string;
  totalFees: string;
  participants: string[];
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

const loadLogo = () => {
  try {
    const logoPath = path.join(process.cwd(), "public", "Logo.png");
    const data = fs.readFileSync(logoPath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
};

export const generateConfirmationPdf = (data: ConfirmationData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  const logo = loadLogo();
  if (logo) {
    doc.addImage(logo, "PNG", margin, 32, 120, 48);
  } else {
    doc.setFontSize(14);
    doc.text("Mastery Academy", margin, 56);
  }

  doc.setFontSize(11);
  doc.text(`Date: ${formatDate(new Date())}`, pageWidth - margin - 120, 56);

  doc.setFontSize(16);
  doc.text("Confirmation", margin, 120);

  doc.setFontSize(11);
  doc.text(`To: ${data.companyName}`, margin, 148);

  const tableStartY = 180;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.rect(margin, tableStartY, pageWidth - margin * 2, 120);

  doc.setFontSize(10);
  const rows = [
    ["Course Title", data.courseTitle],
    ["Date", formatDate(data.courseDate)],
    ["Location", data.location],
    ["Time", data.time],
    ["Fees", data.totalFees],
  ];

  let currentY = tableStartY + 22;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin + 12, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 120, currentY);
    currentY += 20;
  });

  doc.setFontSize(11);
  doc.text("Participants:", margin, tableStartY + 150);
  const participants = data.participants.length
    ? data.participants
    : ["To be confirmed"];
  doc.setFontSize(10);
  participants.forEach((name, idx) => {
    doc.text(`${idx + 1}. ${name}`, margin + 12, tableStartY + 170 + idx * 16);
  });

  const footerY = tableStartY + 240;
  doc.setFontSize(11);
  doc.text("Best Regards,", margin, footerY);
  doc.text("Corporate Secretariat", margin, footerY + 18);
  doc.text("Digital Stamp: ____________________", margin, footerY + 48);

  return doc.output("arraybuffer");
};
