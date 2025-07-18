package com.travelauthority.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelauthority.backend.dto.BookingRequestDTO;
import com.travelauthority.backend.dto.BookingResponseDTO;
import com.travelauthority.backend.entity.Booking;
import com.travelauthority.backend.entity.Package;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.repository.BookingRepository;
import com.travelauthority.backend.repository.PackageRepository;
import com.travelauthority.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final ObjectMapper objectMapper;
    
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request, String userEmail) {
        try {
            // Find the user
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Generate unique booking ID and order number
            String bookingId = "TICK-" + System.currentTimeMillis();
            String orderNumber = "ORD-" + System.currentTimeMillis();
            
            // Convert people counts to JSON string
            String peopleCountsJson = objectMapper.writeValueAsString(request.getPeopleCounts());
            
            // Generate QR code data
            String qrCodeData = generateQRCodeData(bookingId, request.getActivityTitle(), 
                                                 request.getBookingDate(), request.getTotalPersons(), 
                                                 orderNumber, "PENDING");
            
            // Create booking entity
            Booking booking = Booking.builder()
                    .id(bookingId)
                    
                    .title(request.getActivityTitle())
                    .location(request.getActivityLocation())
                    .image(request.getImage())
                    .bookingDate(request.getBookingDate())
                    .status(Booking.BookingStatus.PENDING)
                    .basePrice(request.getBasePrice())
                    .serviceFee(request.getServiceFee())
                    .tax(request.getTax())
                    .totalPrice(request.getTotalPrice())
                    .totalPersons(request.getTotalPersons())
                    .bookingTime(LocalDateTime.now())
                    .paymentMethod(request.getPaymentMethod())
                    .packageId(request.getPackageId())
                    .packageName(request.getPackageName())
                    .activityId(request.getActivityId())
                    .peopleCounts(peopleCountsJson)
                    .description(request.getDescription())
                    .user(user)
                    .contactEmail(request.getContactEmail() != null ? request.getContactEmail() : user.getEmail())
                    .contactPhone(request.getContactPhone() != null ? request.getContactPhone() : user.getPhoneNumber())
                    .ticketInstructions(getDefaultInstructions())
                    .itinerary(getDefaultItinerary(request.getActivityTitle()))
                    .cancellationPolicy(getDefaultCancellationPolicy())
                    .orderNumber(orderNumber)
                    .qrCodeData(qrCodeData)
                    .build();
            
            // Save booking
            Booking savedBooking = bookingRepository.save(booking);
            
            log.info("Booking created successfully: {}", savedBooking.getId());
            
            return convertToResponseDTO(savedBooking);
            
        } catch (Exception e) {
            log.error("Error creating booking: ", e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }
    
    public List<BookingResponseDTO> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Booking> bookings = bookingRepository.findByUserOrderByBookingTimeDesc(user);
        return bookings.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public List<BookingResponseDTO> getUserBookingsByStatus(String userEmail, Booking.BookingStatus status) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Booking> bookings = bookingRepository.findByUserAndStatusOrderByBookingTimeDesc(user, status);
        return bookings.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<BookingResponseDTO> getBookingById(String bookingId, String userEmail) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        
        if (booking.isPresent()) {
            // Check if the booking belongs to the user (unless it's an admin)
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!user.isAdmin() && !booking.get().getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Access denied: Booking does not belong to user");
            }
            
            return Optional.of(convertToResponseDTO(booking.get()));
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public BookingResponseDTO updateBookingStatus(String bookingId, Booking.BookingStatus status, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Check permissions
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.isAdmin() && !booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Cannot modify booking");
        }
        
        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        
        log.info("Booking status updated: {} -> {}", bookingId, status);
        
        return convertToResponseDTO(updatedBooking);
    }
    
    @Transactional
    public BookingResponseDTO updateBookingStatusAsAdmin(String bookingId, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        
        log.info("Booking status updated by admin: {} -> {}", bookingId, status);
        
        return convertToResponseDTO(updatedBooking);
    }
    
    // Admin methods
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    public Long getBookingCountByStatus(Booking.BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }
    
    public Double getTotalRevenue() {
        Double revenue = bookingRepository.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
    
    public Double getRevenueByActivity(Integer activityId) {
        Double revenue = bookingRepository.getRevenueByActivity(activityId);
        return revenue != null ? revenue : 0.0;
    }
    
    private BookingResponseDTO convertToResponseDTO(Booking booking) {
        try {
            // Convert JSON string back to Map
            Map<String, Integer> peopleCounts = objectMapper.readValue(
                    booking.getPeopleCounts(), 
                    objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Integer.class)
            );
            
            // Fetch package features if package ID exists
            List<String> packageFeatures = Collections.emptyList();
            if (booking.getPackageId() != null) {
                Optional<Package> packageEntity = packageRepository.findById(booking.getPackageId());
                if (packageEntity.isPresent() && packageEntity.get().getFeatures() != null) {
                    packageFeatures = packageEntity.get().getFeatures();
                }
            }
            
            return BookingResponseDTO.builder()
                    .id(booking.getId())
                    .title(booking.getTitle())
                    .location(booking.getLocation())
                    .image(booking.getImage())
                    .bookingDate(booking.getBookingDate())
                    .status(booking.getStatus())
                    .basePrice(booking.getBasePrice())
                    .serviceFee(booking.getServiceFee())
                    .tax(booking.getTax())
                    .totalPrice(booking.getTotalPrice())
                    .totalPersons(booking.getTotalPersons())
                    .bookingTime(booking.getBookingTime())
                    .paymentMethod(booking.getPaymentMethod())
                    .packageId(booking.getPackageId())
                    .packageName(booking.getPackageName())
                    .packageFeatures(packageFeatures)
                    .activityId(booking.getActivityId())
                    .peopleCounts(peopleCounts)
                    .description(booking.getDescription())
                    .contactEmail(booking.getContactEmail())
                    .contactPhone(booking.getContactPhone())
                    .ticketInstructions(booking.getTicketInstructions())
                    .itinerary(booking.getItinerary())
                    .cancellationPolicy(booking.getCancellationPolicy())
                    .orderNumber(booking.getOrderNumber())
                    .qrCodeData(booking.getQrCodeData())
                    .userEmail(booking.getUser().getEmail())
                    .userName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
                    .build();
        } catch (Exception e) {
            log.error("Error converting booking to DTO: ", e);
            throw new RuntimeException("Error processing booking data");
        }
    }
    
    private String getDefaultInstructions() {
        return "Please arrive 30 minutes before your scheduled activity time. " +
               "Bring a valid ID and this booking confirmation. " +
               "For any questions, contact our support team.";
    }
    
    private String getDefaultItinerary(String activityTitle) {
        return String.format("Your %s experience includes:\n" +
               "- Welcome and safety briefing\n" +
               "- Activity duration as specified\n" +
               "- All necessary equipment provided\n" +
               "- Professional guide assistance\n" +
               "- Light refreshments (if included in package)", activityTitle);
    }
    
    private String getDefaultCancellationPolicy() {
        return "Free cancellation up to 24 hours before the scheduled activity. " +
               "Cancellations within 24 hours are subject to a 50% charge. " +
               "No-shows will not receive any refund.";
    }
    
    private String generateQRCodeData(String bookingId, String eventTitle, String date, 
                                    Integer persons, String orderNumber, String status) {
        try {
            // Create verification code based on booking ID and timestamp
            long timestamp = System.currentTimeMillis();
            String verificationCode = "VER-" + bookingId + "-" + timestamp;
            
            // Create QR code data with verification information
            Map<String, Object> qrData = Map.of(
                "ticketId", bookingId,
                "eventTitle", eventTitle,
                "date", date,
                "persons", persons,
                "orderNumber", orderNumber,
                "status", status,
                "verificationCode", verificationCode,
                "timestamp", timestamp
            );
            return objectMapper.writeValueAsString(qrData);
        } catch (Exception e) {
            log.error("Error generating QR code data: ", e);
            // Fallback QR code data
            long timestamp = System.currentTimeMillis();
            return String.format("{\"ticketId\":\"%s\",\"eventTitle\":\"%s\",\"date\":\"%s\",\"persons\":%d,\"orderNumber\":\"%s\",\"status\":\"%s\",\"verificationCode\":\"VER-%s-%d\",\"timestamp\":%d}", 
                bookingId, eventTitle, eventTitle, persons, orderNumber, status, bookingId, timestamp, timestamp);
        }
    }
    
    @Transactional
    public BookingResponseDTO verifyQRCode(String qrCodeData, String adminEmail) {
        try {
            // Debug logging
            log.info("QR Code verification request - adminEmail: {}", adminEmail);
            log.info("QR Code data received: {}", qrCodeData);
            
            // Validate input
            if (qrCodeData == null || qrCodeData.trim().isEmpty()) {
                log.error("QR code data is null or empty");
                throw new RuntimeException("QR code data is empty");
            }
            
            // Parse QR code data
            @SuppressWarnings("unchecked")
            Map<String, Object> qrData = objectMapper.readValue(qrCodeData, Map.class);
            String ticketId = (String) qrData.get("ticketId");
            String verificationCode = (String) qrData.get("verificationCode");
            
            if (ticketId == null || verificationCode == null) {
                throw new RuntimeException("Invalid QR code format - missing required fields");
            }
            
            // Find the booking
            Optional<Booking> bookingOpt = bookingRepository.findById(ticketId);
            if (bookingOpt.isEmpty()) {
                throw new RuntimeException("Booking not found for ID: " + ticketId);
            }
            
            Booking booking = bookingOpt.get();
            
            // Check if booking has QR code data stored
            if (booking.getQrCodeData() == null || booking.getQrCodeData().trim().isEmpty()) {
                log.warn("Booking {} has no stored QR code data, generating new one", ticketId);
                // Generate QR code data for existing booking
                String newQrCodeData = generateQRCodeData(
                    booking.getId(), 
                    booking.getTitle(), 
                    booking.getBookingDate(), 
                    booking.getTotalPersons(), 
                    booking.getOrderNumber(), 
                    booking.getStatus().toString()
                );
                booking.setQrCodeData(newQrCodeData);
                booking = bookingRepository.save(booking);
            }
            
            // Verify QR code data matches booking basic info
            String qrEventTitle = (String) qrData.get("eventTitle");
            String qrDate = (String) qrData.get("date");
            Integer qrPersons = (Integer) qrData.get("persons");
            String qrOrderNumber = (String) qrData.get("orderNumber");
            
            // Basic validation against booking data
            if (!booking.getTitle().equals(qrEventTitle)) {
                throw new RuntimeException("QR code event title does not match booking");
            }
            
            if (!booking.getBookingDate().equals(qrDate)) {
                throw new RuntimeException("QR code date does not match booking");
            }
            
            if (!booking.getTotalPersons().equals(qrPersons)) {
                throw new RuntimeException("QR code person count does not match booking");
            }
            
            if (booking.getOrderNumber() != null && !booking.getOrderNumber().equals(qrOrderNumber)) {
                throw new RuntimeException("QR code order number does not match booking");
            }
            
            // Verify the QR code is not from a cancelled booking
            if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                throw new RuntimeException("This ticket has been cancelled and is not valid");
            }
            
            // Log verification
            log.info("QR code verified successfully by admin: {} for booking: {} (Status: {})", 
                    adminEmail, ticketId, booking.getStatus());
            
            return convertToResponseDTO(booking);
            
        } catch (Exception e) {
            log.error("Error verifying QR code: ", e);
            throw new RuntimeException("QR code verification failed: " + e.getMessage());
        }
    }
    
    @Transactional
    public BookingResponseDTO markBookingAsCompleted(String bookingId, String adminEmail) {
        try {
            log.info("Marking booking {} as completed by admin: {}", bookingId, adminEmail);
            
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Check if booking is already completed
            if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
                log.warn("Booking {} is already marked as completed", bookingId);
                return convertToResponseDTO(booking);
            }
            
            // Check if booking is cancelled
            if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
                throw new RuntimeException("Cannot mark cancelled booking as completed");
            }
            
            // Update status to completed
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            Booking updatedBooking = bookingRepository.save(booking);
            
            log.info("Booking {} successfully marked as completed by admin: {}", bookingId, adminEmail);
            
            return convertToResponseDTO(updatedBooking);
            
        } catch (Exception e) {
            log.error("Error marking booking {} as completed: ", bookingId, e);
            throw new RuntimeException("Failed to mark booking as completed: " + e.getMessage());
        }
    }
    
    @Transactional
    public void deleteBooking(String bookingId, String adminEmail) {
        try {
            log.info("Deleting booking {} by admin: {}", bookingId, adminEmail);
            
            // Check if booking exists
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Log the booking details before deletion for audit
            log.info("Deleting booking details - ID: {}, User: {}, Event: {}, Status: {}", 
                    booking.getId(), booking.getUser().getEmail(), booking.getTitle(), booking.getStatus());
            
            // Delete the booking
            bookingRepository.delete(booking);
            
            log.info("Booking {} successfully deleted by admin: {}", bookingId, adminEmail);
            
        } catch (Exception e) {
            log.error("Error deleting booking {}: ", bookingId, e);
            throw new RuntimeException("Failed to delete booking: " + e.getMessage());
        }
    }
    
    @Transactional
    public void deleteAllBookings(String adminEmail) {
        try {
            log.warn("Deleting ALL bookings by admin: {}", adminEmail);
            
            // Get count before deletion for logging
            long bookingCount = bookingRepository.count();
            
            if (bookingCount == 0) {
                log.info("No bookings to delete");
                return;
            }
            
            // Delete all bookings
            bookingRepository.deleteAll();
            
            log.warn("Successfully deleted {} bookings by admin: {}", bookingCount, adminEmail);
            
        } catch (Exception e) {
            log.error("Error deleting all bookings: ", e);
            throw new RuntimeException("Failed to delete all bookings: " + e.getMessage());
        }
    }
}
