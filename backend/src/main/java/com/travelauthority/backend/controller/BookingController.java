package com.travelauthority.backend.controller;

import com.travelauthority.backend.dto.BookingRequestDTO;
import com.travelauthority.backend.dto.BookingResponseDTO;
import com.travelauthority.backend.dto.QRVerificationRequestDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Booking;
import com.travelauthority.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> createBooking(
            @RequestBody BookingRequestDTO request,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        try {
            String email = userEmail != null ? userEmail : "user@example.com";
            BookingResponseDTO booking = bookingService.createBooking(request, email);
            
            return ResponseEntity.ok(ResponseDTO.<BookingResponseDTO>builder()
                    .success(true)
                    .message("Booking created successfully")
                    .data(booking)
                    .build());
        } catch (Exception e) {
            log.error("Error creating booking: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<BookingResponseDTO>builder()
                            .success(false)
                            .message("Failed to create booking: " + e.getMessage())
                            .build());
        }
    }
    
    @GetMapping
    public ResponseEntity<ResponseDTO<List<BookingResponseDTO>>> getUserBookings(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestParam(required = false) String status) {
        try {
            String email = userEmail != null ? userEmail : "user@example.com";
            List<BookingResponseDTO> bookings;
            
            if (status != null && !status.isEmpty()) {
                Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingService.getUserBookingsByStatus(email, bookingStatus);
            } else {
                bookings = bookingService.getUserBookings(email);
            }
            
            return ResponseEntity.ok(ResponseDTO.<List<BookingResponseDTO>>builder()
                    .success(true)
                    .message("Bookings retrieved successfully")
                    .data(bookings)
                    .build());
        } catch (Exception e) {
            log.error("Error retrieving bookings: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<List<BookingResponseDTO>>
                            builder()
                            .success(false)
                            .message("Failed to retrieve bookings: " + e.getMessage())
                            .build());
        }
    }
    
    @GetMapping("/{bookingId}")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> getBookingById(
            @PathVariable String bookingId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        try {
            String email = userEmail != null ? userEmail : "user@example.com";
            Optional<BookingResponseDTO> booking = bookingService.getBookingById(bookingId, email);
            
            if (booking.isPresent()) {
                return ResponseEntity.ok(ResponseDTO.<BookingResponseDTO>builder()
                        .success(true)
                        .message("Booking retrieved successfully")
                        .data(booking.get())
                        .build());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving booking: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<BookingResponseDTO>builder()
                            .success(false)
                            .message("Failed to retrieve booking: " + e.getMessage())
                            .build());
        }
    }
    
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> updateBookingStatus(
            @PathVariable String bookingId,
            @RequestParam String status,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        try {
            String email = userEmail != null ? userEmail : "user@example.com";
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            
            BookingResponseDTO updatedBooking = bookingService.updateBookingStatus(bookingId, bookingStatus, email);
            
            return ResponseEntity.ok(ResponseDTO.<BookingResponseDTO>builder()
                    .success(true)
                    .message("Booking status updated successfully")
                    .data(updatedBooking)
                    .build());
        } catch (Exception e) {
            log.error("Error updating booking status: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<BookingResponseDTO>builder()
                            .success(false)
                            .message("Failed to update booking status: " + e.getMessage())
                            .build());
        }
    }
    
    // Cancel booking (convenience endpoint)
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> cancelBooking(
            @PathVariable String bookingId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        try {
            String email = userEmail != null ? userEmail : "user@example.com";
            BookingResponseDTO cancelledBooking = bookingService.updateBookingStatus(
                    bookingId, Booking.BookingStatus.CANCELLED, email);
            
            return ResponseEntity.ok(ResponseDTO.<BookingResponseDTO>builder()
                    .success(true)
                    .message("Booking cancelled successfully")
                    .data(cancelledBooking)
                    .build());
        } catch (Exception e) {
            log.error("Error cancelling booking: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<BookingResponseDTO>builder()
                            .success(false)
                            .message("Failed to cancel booking: " + e.getMessage())
                            .build());
        }
    }
    
    // QR Code verification endpoint for admin
    @PostMapping("/verify-qr")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> verifyQRCode(
            @RequestBody QRVerificationRequestDTO request,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        try {
            log.info("QR Code verification endpoint called - adminEmail: {}", adminEmail);
            log.info("QR Code verification request: {}", request);
            log.info("QR Code data from request: {}", request != null ? request.getQrCodeData() : "null");
            
            BookingResponseDTO verificationResult = bookingService.verifyQRCode(request.getQrCodeData(), adminEmail);
            
            return ResponseEntity.ok(ResponseDTO.<BookingResponseDTO>builder()
                    .success(true)
                    .message("QR code verified successfully")
                    .data(verificationResult)
                    .build());
        } catch (Exception e) {
            log.error("Error verifying QR code: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<BookingResponseDTO>builder()
                            .success(false)
                            .message("QR code verification failed: " + e.getMessage())
                            .build());
        }
    }
    
    // Mark booking as completed after QR verification
    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> markBookingAsCompleted(
            @PathVariable String bookingId,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        try {
            log.info("Request to mark booking {} as completed by admin: {}", bookingId, adminEmail);
            
            BookingResponseDTO completedBooking = bookingService.markBookingAsCompleted(bookingId, adminEmail);
            
            return ResponseEntity.ok(ResponseDTO.<BookingResponseDTO>builder()
                    .success(true)
                    .message("Booking marked as completed successfully")
                    .data(completedBooking)
                    .build());
        } catch (Exception e) {
            log.error("Error marking booking {} as completed: ", bookingId, e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<BookingResponseDTO>builder()
                            .success(false)
                            .message("Failed to mark booking as completed: " + e.getMessage())
                            .build());
        }
    }
    
    // Delete single booking
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<ResponseDTO<String>> deleteBooking(
            @PathVariable String bookingId,
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        try {
            log.info("Request to delete booking {} by admin: {}", bookingId, adminEmail);
            
            bookingService.deleteBooking(bookingId, adminEmail);
            
            return ResponseEntity.ok(ResponseDTO.<String>builder()
                    .success(true)
                    .message("Booking deleted successfully")
                    .data("Booking " + bookingId + " has been deleted")
                    .build());
        } catch (Exception e) {
            log.error("Error deleting booking {}: ", bookingId, e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<String>builder()
                            .success(false)
                            .message("Failed to delete booking: " + e.getMessage())
                            .build());
        }
    }
    
    // Delete all bookings
    @DeleteMapping("/all")
    public ResponseEntity<ResponseDTO<String>> deleteAllBookings(
            @RequestHeader(value = "X-User-Email", required = false) String adminEmail) {
        try {
            log.warn("Request to delete ALL bookings by admin: {}", adminEmail);
            
            bookingService.deleteAllBookings(adminEmail);
            
            return ResponseEntity.ok(ResponseDTO.<String>builder()
                    .success(true)
                    .message("All bookings deleted successfully")
                    .data("All bookings have been deleted")
                    .build());
        } catch (Exception e) {
            log.error("Error deleting all bookings: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.<String>builder()
                            .success(false)
                            .message("Failed to delete all bookings: " + e.getMessage())
                            .build());
        }
    }
}
