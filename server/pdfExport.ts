import jsPDF from "jspdf";
import { type Post } from "@shared/schema";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function addHeaderAndFooter(
  doc: jsPDF, 
  pageNum: number, 
  totalPages: number, 
  userName: string,
  userEmail: string,
  pageWidth: number,
  pageHeight: number,
  margin: number
) {
  doc.setPage(pageNum);
  
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  
  const headerY = 0.35;
  doc.text("ContentCalendarForHairPros.com", margin, headerY);
  const licensedTo = userName ? `${userName} (${userEmail})` : userEmail;
  doc.text(`Licensed to: ${licensedTo}`, pageWidth - margin, headerY, { align: "right" });
  
  const footerY = pageHeight - 0.45;
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 60, 60);
  doc.text("UNAUTHORIZED DISTRIBUTION PROHIBITED", pageWidth / 2, footerY + 0.15, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text("This content is licensed for personal use only. Sharing, redistributing, or reselling is strictly prohibited.", pageWidth / 2, footerY + 0.28, { align: "center" });
}

function addCalendarGridPage(
  doc: jsPDF, 
  posts: Post[], 
  month: number, 
  year: number,
  margin: number,
  pageWidth: number
) {
  const contentWidth = pageWidth - (margin * 2);
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  
  let yPosition = margin + 0.4;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(180, 130, 115);
  doc.text(`${months[month - 1]} ${year}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 0.5;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text("Content Calendar for Hair Pros", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 0.5;
  
  const cellWidth = contentWidth / 7;
  const cellHeight = 1.1;
  const gridStartX = margin;
  const gridStartY = yPosition;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  for (let i = 0; i < 7; i++) {
    const x = gridStartX + (i * cellWidth) + (cellWidth / 2);
    doc.text(daysOfWeek[i], x, gridStartY, { align: "center" });
  }
  yPosition = gridStartY + 0.25;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 0.15;
  
  const postsByDay: { [key: number]: Post } = {};
  for (const post of posts) {
    postsByDay[post.day] = post;
  }
  
  let currentDay = 1;
  let row = 0;
  
  while (currentDay <= daysInMonth) {
    for (let col = 0; col < 7; col++) {
      if ((row === 0 && col < firstDay) || currentDay > daysInMonth) {
        if (row === 0 && col < firstDay) continue;
        if (currentDay > daysInMonth) break;
      }
      
      const cellX = gridStartX + (col * cellWidth);
      const cellY = yPosition + (row * cellHeight);
      
      doc.setDrawColor(230, 230, 230);
      doc.rect(cellX, cellY, cellWidth, cellHeight);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(String(currentDay), cellX + 0.08, cellY + 0.18);
      
      const post = postsByDay[currentDay];
      if (post) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(100, 100, 100);
        
        const maxTitleWidth = cellWidth - 0.12;
        const titleLines = doc.splitTextToSize(post.title, maxTitleWidth);
        const displayTitle = titleLines.slice(0, 2);
        
        let titleY = cellY + 0.35;
        for (const line of displayTitle) {
          doc.text(line, cellX + 0.06, titleY);
          titleY += 0.12;
        }
        
        doc.setFontSize(5);
        doc.setTextColor(180, 130, 115);
        doc.text(post.category, cellX + 0.06, cellY + cellHeight - 0.08);
      }
      
      currentDay++;
    }
    row++;
  }
}

export function generateMonthPDF(posts: Post[], month: number, userName: string = "", userEmail: string = "Unknown", year: number = new Date().getFullYear()): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter"
  });

  const pageWidth = 8.5;
  const pageHeight = 11;
  const margin = 0.75;
  const contentWidth = pageWidth - (margin * 2);
  const lineHeight = 0.18;
  const postSpacing = 0.3;

  addCalendarGridPage(doc, posts, month, year, margin, pageWidth);

  doc.addPage();
  let yPosition = margin + 0.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(180, 130, 115);
  doc.text(`${months[month - 1]} ${year} - Daily Posts`, margin, yPosition);
  yPosition += 0.4;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 0.3;

  const sortedPosts = [...posts].sort((a, b) => a.day - b.day);

  for (const post of sortedPosts) {
    const estimatedHeight = 0.9;
    
    if (yPosition + estimatedHeight > pageHeight - margin - 0.4) {
      doc.addPage();
      yPosition = margin + 0.5;
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
    const maxDescLines = 3;
    const displayLines = descLines.slice(0, maxDescLines);
    for (const line of displayLines) {
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    }

    if (post.hashtags.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(180, 130, 115);
      const hashtagsText = post.hashtags.slice(0, 6).join(" ");
      doc.text(hashtagsText, margin, yPosition);
      yPosition += lineHeight;
    }

    yPosition += postSpacing;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    addHeaderAndFooter(doc, i, pageCount, userName, userEmail, pageWidth, pageHeight, margin);
  }

  return Buffer.from(doc.output('arraybuffer'));
}
