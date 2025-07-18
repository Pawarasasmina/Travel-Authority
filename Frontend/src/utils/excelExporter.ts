import * as XLSX from 'xlsx';

interface BookingData {
  id: string;
  activityTitle: string;
  activityLocation: string;
  userName?: string;
  userEmail?: string;
  bookingDate: string;
  totalPersons: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  bookingTime: string;
  packageName?: string;
  peopleCounts: Record<string, number>;
}

interface ExcelBookingData {
  'Booking ID': string;
  'Activity Title': string;
  'Activity Location': string;
  'Customer Name': string;
  'Customer Email': string;
  'Booking Date': string;
  'Travel Date': string;
  'Total Persons': number;
  'Foreign Adults': number;
  'Foreign Kids': number;
  'Local Adults': number;
  'Local Kids': number;
  'Package Name': string;
  'Total Price (LKR)': number;
  'Payment Method': string;
  'Status': string;
  'Booking Time': string;
}

export const exportBookingsToExcel = (bookings: BookingData[], filename?: string) => {
  try {
    // Transform booking data to Excel format
    const excelData: ExcelBookingData[] = bookings.map(booking => {
      // Extract people counts with fallback values
      const peopleCounts = booking.peopleCounts || {};
      const foreignAdult = peopleCounts.foreignAdult || peopleCounts['Foreign Adult'] || 0;
      const foreignKids = peopleCounts.foreignKids || peopleCounts['Foreign Kids'] || 0;
      const localAdult = peopleCounts.localAdult || peopleCounts['Local Adult'] || 0;
      const localKids = peopleCounts.localKids || peopleCounts['Local Kids'] || 0;

      return {
        'Booking ID': booking.id,
        'Activity Title': booking.activityTitle,
        'Activity Location': booking.activityLocation,
        'Customer Name': booking.userName || 'N/A',
        'Customer Email': booking.userEmail || 'N/A',
        'Booking Date': formatDateForExcel(booking.bookingTime),
        'Travel Date': formatDateForExcel(booking.bookingDate),
        'Total Persons': booking.totalPersons,
        'Foreign Adults': foreignAdult,
        'Foreign Kids': foreignKids,
        'Local Adults': localAdult,
        'Local Kids': localKids,
        'Package Name': booking.packageName || 'N/A',
        'Total Price (LKR)': booking.totalPrice,
        'Payment Method': booking.paymentMethod,
        'Status': booking.status,
        'Booking Time': formatDateForExcel(booking.bookingTime)
      };
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // Booking ID
      { wch: 30 }, // Activity Title
      { wch: 25 }, // Activity Location
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Customer Email
      { wch: 15 }, // Booking Date
      { wch: 15 }, // Travel Date
      { wch: 12 }, // Total Persons
      { wch: 12 }, // Foreign Adults
      { wch: 12 }, // Foreign Kids
      { wch: 12 }, // Local Adults
      { wch: 12 }, // Local Kids
      { wch: 20 }, // Package Name
      { wch: 15 }, // Total Price
      { wch: 15 }, // Payment Method
      { wch: 12 }, // Status
      { wch: 18 }  // Booking Time
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    // Generate filename if not provided
    const defaultFilename = `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    const exportFilename = filename || defaultFilename;

    // Write and download the file
    XLSX.writeFile(workbook, exportFilename);

    return {
      success: true,
      message: `Excel file "${exportFilename}" has been downloaded successfully.`,
      recordCount: bookings.length
    };

  } catch (error) {
    console.error('Error exporting bookings to Excel:', error);
    return {
      success: false,
      message: 'Failed to export bookings to Excel: ' + (error as Error).message,
      recordCount: 0
    };
  }
};

export const exportFilteredBookingsToExcel = (
  bookings: BookingData[],
  filters: {
    searchTerm?: string;
    statusFilter?: string;
    dateRange?: { start: string; end: string };
  },
  filename?: string
) => {
  try {
    let filteredBookings = [...bookings];

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredBookings = filteredBookings.filter(booking =>
        booking.activityTitle.toLowerCase().includes(searchTerm) ||
        booking.userEmail?.toLowerCase().includes(searchTerm) ||
        booking.userName?.toLowerCase().includes(searchTerm) ||
        booking.id.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.statusFilter && filters.statusFilter !== 'ALL') {
      filteredBookings = filteredBookings.filter(booking => 
        booking.status === filters.statusFilter
      );
    }

    // Apply date range filter if provided
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    // Generate filename with filter info
    let filterInfo = '';
    if (filters.statusFilter && filters.statusFilter !== 'ALL') {
      filterInfo += `_${filters.statusFilter}`;
    }
    if (filters.searchTerm) {
      filterInfo += `_filtered`;
    }
    
    const defaultFilename = `bookings_export${filterInfo}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const exportFilename = filename || defaultFilename;

    return exportBookingsToExcel(filteredBookings, exportFilename);

  } catch (error) {
    console.error('Error exporting filtered bookings to Excel:', error);
    return {
      success: false,
      message: 'Failed to export filtered bookings to Excel: ' + (error as Error).message,
      recordCount: 0
    };
  }
};

// Helper function to format dates for Excel
const formatDateForExcel = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateString;
  }
};

// Function to generate summary statistics
export const generateBookingsSummary = (bookings: BookingData[]) => {
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  const statusCounts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const packageCounts = bookings.reduce((acc, booking) => {
    const packageName = booking.packageName || 'No Package';
    acc[packageName] = (acc[packageName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalBookings,
    totalRevenue,
    statusCounts,
    packageCounts,
    averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
  };
};
