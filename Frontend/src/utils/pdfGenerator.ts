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
    pdf.setFontSize(24);
    pdf.text('TICKETS.LK', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text('E-Ticket Confirmation', pageWidth / 2, 30, { align: 'center' });
    
    // Main content
    pdf.setTextColor(51, 51, 51);
    let yPos = 60;
    
    // Event Title
    pdf.setFontSize(18);
    pdf.text(ticketData.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    pdf.setFontSize(14);
    pdf.setTextColor(102, 102, 102);
    pdf.text(ticketData.location, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Status badge
    pdf.setFillColor(16, 185, 129); // Green
    pdf.roundedRect(pageWidth / 2 - 15, yPos - 5, 30, 8, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(ticketData.status, pageWidth / 2, yPos, { align: 'center' });
    yPos += 25;
    
    // Booking details
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(14);
    pdf.text('Booking Information', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text('Booking ID:', 20, yPos);
    pdf.text(ticketData.id, 60, yPos);
    yPos += 8;
    
    if (ticketData.orderNumber) {
      pdf.text('Order Number:', 20, yPos);
      pdf.text(ticketData.orderNumber, 60, yPos);
      yPos += 8;
    }
    
    pdf.text('Travel Date:', 20, yPos);
    pdf.text(new Date(ticketData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 60, yPos);
    yPos += 8;
    
    pdf.text('Travelers:', 20, yPos);
    pdf.text(`${ticketData.persons} ${ticketData.persons > 1 ? 'Persons' : 'Person'}`, 60, yPos);
    yPos += 8;
    
    if (ticketData.paymentMethod) {
      pdf.text('Payment Method:', 20, yPos);
      pdf.text(ticketData.paymentMethod, 60, yPos);
      yPos += 15;
    } else {
      yPos += 10;
    }
    
    // Price details
    pdf.setFontSize(14);
    pdf.text('Price Details', 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    const basePrice = ticketData.basePrice || ((ticketData.price / 1.2) * 0.9);
    const serviceFee = ticketData.serviceFee || ((ticketData.price / 1.2) * 0.1);
    const tax = ticketData.tax || (ticketData.price - (ticketData.price / 1.2));
    
    pdf.text('Base Price:', 20, yPos);
    pdf.text(`Rs. ${basePrice.toLocaleString()}`, 60, yPos);
    yPos += 8;
    
    pdf.text('Service Fee:', 20, yPos);
    pdf.text(`Rs. ${serviceFee.toLocaleString()}`, 60, yPos);
    yPos += 8;
    
    pdf.text('Taxes:', 20, yPos);
    pdf.text(`Rs. ${tax.toLocaleString()}`, 60, yPos);
    yPos += 8;
    
    // Total line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;
    
    pdf.setFontSize(12);
    pdf.text('Total Amount:', 20, yPos);
    pdf.setTextColor(255, 127, 80);
    pdf.text(`Rs. ${ticketData.price.toLocaleString()}`, 60, yPos);
    yPos += 20;
    
    // QR Code section
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(14);
    pdf.text('Ticket QR Code', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
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
      
      // Add QR code to PDF
      pdf.addImage(qrCodeDataURL, 'PNG', pageWidth / 2 - 25, yPos, 50, 50);
      yPos += 60;
    } catch (qrError) {
      console.error('QR code generation failed:', qrError);
      // Fallback: draw a simple rectangle
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(pageWidth / 2 - 25, yPos, 50, 50);
      pdf.setFontSize(8);
      pdf.text('QR CODE', pageWidth / 2, yPos + 25, { align: 'center' });
      pdf.text('ERROR', pageWidth / 2, yPos + 30, { align: 'center' });
      yPos += 60;
    }
    
    pdf.setFontSize(10);
    pdf.text('Scan this code at the venue', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    pdf.setFontSize(8);
    pdf.setTextColor(153, 153, 153);
    pdf.text(`Ticket ID: ${ticketData.id}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Instructions
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(12);
    pdf.text('Important Instructions', 20, yPos);
    yPos += 10;
    
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
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text('Contact Information', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    pdf.setFontSize(8);
    pdf.text(`${ticketData.contactEmail || 'info@tickets.lk'} | ${ticketData.contactPhone || '+94 11 234 5678'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    pdf.setTextColor(153, 153, 153);
    pdf.text('© 2024 Tickets.lk - All rights reserved', pageWidth / 2, yPos, { align: 'center' });
    
    // Save the PDF
    const fileName = `ticket-${ticketData.id}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error('Failed to generate ticket PDF. Please try again.');
  }
};
