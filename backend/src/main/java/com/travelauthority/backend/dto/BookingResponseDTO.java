package com.travelauthority.backend.dto;

import com.travelauthority.backend.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private String id;
    private String title;
    private String location;
    private String image;
    private String bookingDate;
    private Booking.BookingStatus status;
    private Double basePrice;
    private Double serviceFee;
    private Double tax;
    private Double totalPrice;
    private Integer totalPersons;
    private LocalDateTime bookingTime;
    private String paymentMethod;
    private Long packageId;
    private String packageName;
    private Integer activityId;
    private Map<String, Integer> peopleCounts;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private String ticketInstructions;
    private String itinerary;
    private String cancellationPolicy;
    private String orderNumber;
    
    // User information (for admin views)
    private String userEmail;
    private String userName;
}
