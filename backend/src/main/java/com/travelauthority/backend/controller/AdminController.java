package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.BookingResponseDTO;
import com.travelauthority.backend.service.AdminService;
import com.travelauthority.backend.service.UserService;
import com.travelauthority.backend.service.BookingService;
import com.travelauthority.backend.entity.Booking;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private BookingService bookingService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<ResponseDTO> getDashboardData(@RequestHeader("Authorization") String authHeader) {
        log.info("Admin dashboard data request received");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = adminService.getDashboardData(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<ResponseDTO> getAllUsers() {
        log.info("Admin request to get all users");
        ResponseDTO response = userService.getAllUsers();
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ResponseDTO> updateUserRole(@PathVariable int userId, @RequestBody Map<String, String> roleData) {
        log.info("Admin request to update user role for user ID: {}", userId);
        
        String role = roleData.get("role");
        if (role == null) {
            ResponseDTO errorResponse = new ResponseDTO();
            errorResponse.setStatus(HttpStatus.BAD_REQUEST.toString());
            errorResponse.setMessage("Role is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        ResponseDTO response = adminService.updateUserRole(userId, role);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/check-admin")
    public ResponseEntity<ResponseDTO> checkAdminAccess(@RequestHeader("Authorization") String authHeader) {
        log.info("Checking admin access");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = adminService.checkAdminAccess(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/check-owner")
    public ResponseEntity<ResponseDTO> checkTravelActivityOwnerAccess(@RequestHeader("Authorization") String authHeader) {
        log.info("Checking travel activity owner access");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = adminService.checkTravelActivityOwnerAccess(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/owner/dashboard")
    public ResponseEntity<ResponseDTO> getTravelOwnerDashboardData(@RequestHeader("Authorization") String authHeader) {
        log.info("Travel activity owner dashboard data request received");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = adminService.getTravelOwnerDashboardData(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/bookings")
    public ResponseEntity<ResponseDTO<List<BookingResponseDTO>>> getAllBookings() {
        log.info("Admin request to get all bookings");
        try {
            List<BookingResponseDTO> bookings = bookingService.getAllBookings();
            ResponseDTO<List<BookingResponseDTO>> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Bookings retrieved successfully");
            response.setData(bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving all bookings: ", e);
            ResponseDTO<List<BookingResponseDTO>> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to retrieve bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> updateBookingStatus(
            @PathVariable String bookingId, 
            @RequestBody Map<String, String> statusData) {
        log.info("Admin request to update booking status for booking ID: {}", bookingId);
        
        String status = statusData.get("status");
        if (status == null) {
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("BAD_REQUEST");
            errorResponse.setMessage("Status is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            BookingResponseDTO updatedBooking = bookingService.updateBookingStatusAsAdmin(bookingId, bookingStatus);
            
            ResponseDTO<BookingResponseDTO> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Booking status updated successfully");
            response.setData(updatedBooking);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("BAD_REQUEST");
            errorResponse.setMessage("Invalid status: " + status);
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating booking status: ", e);
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to update booking status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
