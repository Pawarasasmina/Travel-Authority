import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface TicketData {
  id: string;
  title: string;
  location: string;
  date: string;
  persons: number;
  price: number;
  status: string;
  image?: string;
  orderNumber?: string;
  bookingTime?: string;
  paymentMethod?: string;
  basePrice?: number;
  serviceFee?: number;
  tax?: number;
  packageName?: string;
  packageFeatures?: string[];
  contactEmail?: string;
  contactPhone?: string;
  ticketInstructions?: string;
  itinerary?: string;
  cancellationPolicy?: string;
}

export const generateSimpleTicketPDF = async (ticketData: TicketData): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Generate QR code data
    const qrCodeData = JSON.stringify({
      ticketId: ticketData.id,
      eventTitle: ticketData.title,
      date: ticketData.date,
      persons: ticketData.persons,
      orderNumber: ticketData.orderNumber,
      status: ticketData.status,
      verificationCode: `VER-${ticketData.id}-${Date.parse(ticketData.date)}`
    });
    
    // Header
    pdf.setFillColor(255, 127, 80); // Orange
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.text('TRAVEL.LK', pageWidth / 2, 18, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(13);
    pdf.text('E-Ticket Confirmation', pageWidth / 2, 32, { align: 'center' });

    // Main content
    pdf.setTextColor(51, 51, 51);
    let yPos = 52;

    // Event Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(ticketData.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(13);
    pdf.setTextColor(102, 102, 102);
    pdf.text(ticketData.location, pageWidth / 2, yPos, { align: 'center' });
    yPos += 14;

    // Status badge
    pdf.setFillColor(16, 185, 129); // Green
    pdf.roundedRect(pageWidth / 2 - 18, yPos - 6, 36, 12, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(ticketData.status, pageWidth / 2, yPos + 2, { align: 'center' });
    yPos += 15;

    // Booking details box
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, yPos -1, pageWidth - 30, 46, 3, 3);
    pdf.setTextColor(51, 51, 51);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Booking Information', 20, yPos + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    let infoY = yPos + 15;
    pdf.text('Booking ID:', 20, infoY);
    pdf.text(ticketData.id, 55, infoY);
    infoY += 7;

    if (ticketData.orderNumber) {
      pdf.text('Order Number:', 20, infoY);
      pdf.text(ticketData.orderNumber, 55, infoY);
      infoY += 7;
    }

    pdf.text('Travel Date:', 20, infoY);
    pdf.text(new Date(ticketData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 55, infoY);
    infoY += 7;

    pdf.text('Travelers:', 20, infoY);
    pdf.text(`${ticketData.persons} ${ticketData.persons > 1 ? 'Persons' : 'Person'}`, 55, infoY);
    infoY += 7;

    if (ticketData.paymentMethod) {
      pdf.text('Payment Method:', 20, infoY);
      pdf.text(ticketData.paymentMethod, 55, infoY);
      infoY += 7;
    }

    yPos += 50;

    // Price details box
    pdf.setDrawColor(220, 220, 220);
    pdf.roundedRect(15, yPos - 1, pageWidth - 30, 32, 3, 3);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(51, 51, 51);
    pdf.text('Price Details', 20, yPos + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    let priceY = yPos + 15;
    const basePrice = ticketData.basePrice || ((ticketData.price / 1.2) * 0.9);
    const serviceFee = ticketData.serviceFee || ((ticketData.price / 1.2) * 0.1);
    const tax = ticketData.tax || (ticketData.price - (ticketData.price / 1.2));

    pdf.text('Base Price:', 20, priceY);
    pdf.text(`Rs. ${basePrice.toLocaleString()}`, 55, priceY);
    priceY += 7;

    pdf.text('Service Fee:', 20, priceY);
    pdf.text(`Rs. ${serviceFee.toLocaleString()}`, 55, priceY);
    priceY += 7;

    pdf.text('Taxes:', 20, priceY);
    pdf.text(`Rs. ${tax.toLocaleString()}`, 55, priceY);
    priceY += 7;

    // Total line
    pdf.setDrawColor(200, 200, 200);
    const lineMargin = 40;
    pdf.line(lineMargin, priceY, pageWidth - lineMargin, priceY);
    priceY += 7;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Total Amount:', 20, priceY);
    pdf.setTextColor(255, 127, 80);
    pdf.text(`Rs. ${ticketData.price.toLocaleString()}`, 55, priceY);

    yPos += 34;

    // QR Code section with background
    pdf.setFillColor(245, 245, 245);
    pdf.roundedRect(15, yPos, pageWidth - 30, 60, 4, 4, 'F');
    pdf.setDrawColor(220, 220, 220);
    pdf.roundedRect(15, yPos, pageWidth - 30, 60, 4, 4);

    pdf.setTextColor(51, 51, 51);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Ticket QR Code', pageWidth / 2, yPos + 10, { align: 'center' });

    let qrY = yPos + 16;
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Add QR code to PDF (left aligned in box)
      const qrX = 22;
      const qrSize = 40;
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      // Place text on the same line, right aligned in box
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Scan this code at the venue', pageWidth - 22, qrY + qrSize / 2 + 2, { align: 'right' });

    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
      // Fallback: draw a simple rectangle (left aligned in box)
      const qrX = 22;
      const qrSize = 40;
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(qrX, qrY, qrSize, qrSize);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('QR CODE', qrX + qrSize / 2, qrY + 18, { align: 'center' });
      pdf.text('ERROR', qrX + qrSize / 2, qrY + 23, { align: 'center' });

      // Place text on the same line, right aligned in box
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Scan this code at the venue', pageWidth - 22, qrY + qrSize / 2 + 2, { align: 'right' });
    }

    yPos += 60;

    // Ticket ID below QR section
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(153, 153, 153);
    pdf.text(`Ticket ID: ${ticketData.id}`, pageWidth / 2, yPos + 4, { align: 'center' });
    yPos += 16;

    // Instructions
    pdf.setTextColor(51, 51, 51);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Important Instructions', 20, yPos);
    yPos += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const instructions = [
      '• Please arrive 15 minutes before the scheduled time',
      '• Bring a valid ID for verification',
      '• Show this ticket and QR code at the venue',
      '• Keep this ticket safe for the duration of your visit'
    ];

    if (ticketData.ticketInstructions) {
      instructions.push(`• ${ticketData.ticketInstructions}`);
    }

    instructions.forEach(instruction => {
      pdf.text(instruction, 20, yPos);
      yPos += 6;
    });

    // Footer
    yPos = pageHeight - 30;
    pdf.setDrawColor(238, 238, 238);
   
    yPos += 10;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);

    yPos += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(51, 51, 51);
    pdf.text(`${ticketData.contactEmail || 'info@tickets.lk'} | ${ticketData.contactPhone || '+94 11 234 5678'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    pdf.setTextColor(153, 153, 153);
    pdf.setFontSize(8);
    pdf.text('© 2024 Tickets.lk - All rights reserved', pageWidth / 2, yPos, { align: 'center' });

    // Save the PDF
    const fileName = `ticket-${ticketData.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error('Failed to generate ticket PDF. Please try again.');
  }
};
