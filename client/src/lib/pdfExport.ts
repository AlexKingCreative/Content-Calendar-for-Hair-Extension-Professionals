import jsPDF from "jspdf";
import { type Post } from "@shared/schema";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function exportMonthToPDF(posts: Post[], month: number, year: number = new Date().getFullYear()) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter"
  });

  const pageWidth = 8.5;
  const pageHeight = 11;
  const margin = 0.75;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;
  const lineHeight = 0.18;
  const postSpacing = 0.3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(180, 130, 115);
  doc.text(`${months[month - 1]} ${year}`, margin, yPosition + 0.25);
  yPosition += 0.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("Content Calendar for Hair Extension Professionals", margin, yPosition);
  yPosition += 0.4;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 0.3;

  const sortedPosts = [...posts].sort((a, b) => a.day - b.day);

  for (const post of sortedPosts) {
    const estimatedHeight = 0.8;
    
    if (yPosition + estimatedHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Day ${post.day}: ${post.title}`, margin, yPosition);
    yPosition += lineHeight + 0.05;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${post.category} | ${post.contentType}`, margin, yPosition);
    yPosition += lineHeight + 0.02;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(post.description, contentWidth);
    const maxDescLines = 2;
    const displayLines = descLines.slice(0, maxDescLines);
    for (const line of displayLines) {
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    }

    if (post.hashtags.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(150, 100, 90);
      const hashtagsText = post.hashtags.slice(0, 5).join(" ");
      doc.text(hashtagsText, margin, yPosition);
      yPosition += lineHeight;
    }

    yPosition += postSpacing;
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerY = pageHeight - 0.5;
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, footerY, { align: "center" });
  }

  doc.save(`content-calendar-${months[month - 1].toLowerCase()}-${year}.pdf`);
}
