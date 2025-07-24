package com.travelauthority.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {
    private Integer activityId;
    private String activityTitle;
    private String activityLocation;
    private String image;
    private String description;
    private String bookingDate;
    private Long packageId;
    private String packageName;
    private Double basePrice;
    private Double serviceFee;
    private Double tax;
    private Double totalPrice;
    private Integer totalPersons;
    private String paymentMethod;
    private Map<String, Integer> peopleCounts;
    
    // Contact information
    private String contactEmail;
    private String contactPhone;
    
    // Optional fields
    private String ticketInstructions;
    private String itinerary;
    private String cancellationPolicy;
    
    // Discount information
    private Boolean hasDiscount;
    private Double discountPercentage;
    private String offerTitle;
}
