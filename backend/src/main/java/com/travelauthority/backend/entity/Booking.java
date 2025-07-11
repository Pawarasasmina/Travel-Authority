package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    private String id; // Will be generated in format TICK-{timestamp}

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String location;

    @Column(length = 500)
    private String image;

    @Column(nullable = false)
    private String bookingDate; // The date for the activity

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(nullable = false)
    private Double basePrice;

    @Column(nullable = false)
    private Double serviceFee;

    @Column(nullable = false)
    private Double tax;

    @Column(nullable = false)
    private Double totalPrice;

    @Column(nullable = false)
    private Integer totalPersons;

    @Column(nullable = false)
    private LocalDateTime bookingTime;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = true)
    private Long packageId;

    @Column(nullable = true)
    private String packageName;

    @Column(nullable = false)
    private Integer activityId;

    // Store people counts as JSON string
    @Column(length = 1000)
    private String peopleCounts; // JSON format: {"foreignAdult": 2, "localKids": 1}

    @Column(length = 2000)
    private String description;

    // User who made the booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Contact information
    @Column(length = 500)
    private String contactEmail;

    @Column(length = 20)
    private String contactPhone;

    // Additional booking details
    @Column(length = 2000)
    private String ticketInstructions;

    @Column(length = 2000)
    private String itinerary;

    @Column(length = 1000)
    private String cancellationPolicy;

    // Order number for reference
    @Column(unique = true)
    private String orderNumber;

    // QR code data for ticket verification
    @Column(length = 2000)
    private String qrCodeData;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED
    }
}
