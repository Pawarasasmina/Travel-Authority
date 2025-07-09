package com.travelauthority.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelauthority.backend.dto.BookingRequestDTO;
import com.travelauthority.backend.dto.BookingResponseDTO;
import com.travelauthority.backend.entity.Booking;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.repository.BookingRepository;
import com.travelauthority.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
                    .activityId(booking.getActivityId())
                    .peopleCounts(peopleCounts)
                    .description(booking.getDescription())
                    .contactEmail(booking.getContactEmail())
                    .contactPhone(booking.getContactPhone())
                    .ticketInstructions(booking.getTicketInstructions())
                    .itinerary(booking.getItinerary())
                    .cancellationPolicy(booking.getCancellationPolicy())
                    .orderNumber(booking.getOrderNumber())
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
}
