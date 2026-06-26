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
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;

  // --- Header (logo + date aligned on same horizontal band) ---
  const logo = loadLogo();
  const logoY = 40;
  const logoHeight = 40;
  if (logo) {
    // Brand header: Mastery Academy logo at top-left
    doc.addImage(logo, "PNG", margin, logoY, 120, logoHeight);
  } else {
    doc.setFontSize(14);
    doc.text("Mastery Academy", margin, logoY + 16);
  }

  // Header meta (date) aligned to the right
  doc.setFontSize(11);
  const headerCenterY = logoY + logoHeight / 2;
  doc.text(
    `Date: ${formatDate(new Date())}`,
    pageWidth - margin - 150,
    headerCenterY
  );

  // Main title
  doc.setFontSize(16);
  let currentY = logoY + logoHeight + 40;
  doc.text("Confirmation Letter", margin, currentY);

  // Recipient line – business style: TO: [Company Name]
  doc.setFontSize(11);
  currentY += 24;
  doc.text(`TO: ${data.companyName}`, margin, currentY);

  // --- Participants section BEFORE table ---
  currentY += 30;
  doc.setFontSize(11);
  const introLines = doc.splitTextToSize(
    "We would like to inform you that the following participants have been registered on the course below:",
    pageWidth - margin * 2
  );
  introLines.forEach((line: string) => {
    doc.text(line, margin, currentY);
    currentY += 14;
  });

  currentY += 10;
  doc.setFontSize(11);
  doc.text("Participants:", margin, currentY);
  currentY += 18;

  const participants = data.participants.length
    ? data.participants
    : ["To be confirmed"];
  doc.setFontSize(10);
  participants.forEach((name, idx) => {
    doc.text(`${idx + 1}. ${name}`, margin + 12, currentY);
    currentY += 14;
  });

  // Add some breathing room before table
  currentY += 22;

  // --- Technical details table ---
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);

  doc.setFontSize(10);
  const rows: [string, string][] = [
    ["Course Title", data.courseTitle],
    ["Date", formatDate(data.courseDate)],
    ["Location", data.location],
    ["Time", data.time],
  ];

  const feesValue = data.totalFees?.toString().trim();
  if (feesValue) {
    // Only show Fees row when a value is provided
    rows.push(["Fees", feesValue]);
  }

  const tableTopY = currentY;
  const rowHeight = 22;
  const tableWidth = pageWidth - margin * 2;
  const labelColWidth = 140;

  // Light background for label column
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, tableTopY, labelColWidth, rowHeight * rows.length, "F");

  // Outer border
  doc.rect(margin, tableTopY, tableWidth, rowHeight * rows.length);

  // Vertical separator between label and value columns
  const labelSeparatorX = margin + labelColWidth;
  doc.line(
    labelSeparatorX,
    tableTopY,
    labelSeparatorX,
    tableTopY + rowHeight * rows.length
  );

  // Horizontal lines between rows + cell text
  let rowY = tableTopY + 15;
  rows.forEach(([label, value], index) => {
    if (index > 0) {
      const y = tableTopY + rowHeight * index;
      doc.line(margin, y, margin + tableWidth, y);
    }
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin + 10, rowY);
    doc.setFont("helvetica", "normal");
    doc.text(value, labelSeparatorX + 10, rowY);
    rowY += rowHeight;
  });

  currentY = tableTopY + rowHeight * rows.length + 40;

  // If footer would overflow, move it to a new page
  if (currentY + 60 > pageHeight - margin) {
    doc.addPage();
    currentY = margin + 80;
  }

  const footerY = currentY;
  doc.setFontSize(11);
  doc.text("Best Regards,", margin, footerY);
  doc.text("Corporate Secretariat", margin, footerY + 18);
  doc.text("Digital Stamp: ____________________", margin, footerY + 48);

  return doc.output("arraybuffer");
};
