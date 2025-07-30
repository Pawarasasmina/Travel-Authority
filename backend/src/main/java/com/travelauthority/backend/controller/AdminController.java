package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.BookingResponseDTO;
import com.travelauthority.backend.dto.CreateNotificationDTO;
import com.travelauthority.backend.dto.NotificationDTO;
import com.travelauthority.backend.service.AdminService;
import com.travelauthority.backend.service.UserService;
import com.travelauthority.backend.service.BookingService;
import com.travelauthority.backend.service.NotificationService;
import com.travelauthority.backend.entity.Booking;
import com.travelauthority.backend.entity.Notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;

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
    
    @Autowired
    private NotificationService notificationService;
    
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
    
    // Travel Activity Owner Booking Management Endpoints
    
    @GetMapping("/owner/bookings")
    public ResponseEntity<ResponseDTO<List<BookingResponseDTO>>> getOwnerBookings(@RequestHeader("Authorization") String authHeader) {
        log.info("Travel activity owner request to get own bookings");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify token and check travel activity owner access
            ResponseDTO accessCheck = adminService.checkTravelActivityOwnerAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<List<BookingResponseDTO>>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Travel activity owner access required")
                        .build());
            }
            
            List<BookingResponseDTO> bookings = bookingService.getBookingsByActivityOwnerToken(token);
            ResponseDTO<List<BookingResponseDTO>> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Owner bookings retrieved successfully");
            response.setData(bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error retrieving owner bookings: ", e);
            ResponseDTO<List<BookingResponseDTO>> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to retrieve owner bookings: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PutMapping("/owner/bookings/{bookingId}/status")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> updateOwnerBookingStatus(
            @PathVariable String bookingId, 
            @RequestBody Map<String, String> statusData,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Travel activity owner request to update booking status for booking ID: {}", bookingId);
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        String status = statusData.get("status");
        if (status == null) {
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("BAD_REQUEST");
            errorResponse.setMessage("Status is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            // Verify token and check travel activity owner access
            ResponseDTO accessCheck = adminService.checkTravelActivityOwnerAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<BookingResponseDTO>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Travel activity owner access required")
                        .build());
            }
            
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            BookingResponseDTO updatedBooking = bookingService.updateBookingStatusAsOwnerToken(bookingId, bookingStatus, token);
            
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
    
    @PostMapping("/owner/bookings/{bookingId}/complete")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> markOwnerBookingAsCompleted(
            @PathVariable String bookingId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Travel activity owner request to mark booking {} as completed", bookingId);
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify token and check travel activity owner access
            ResponseDTO accessCheck = adminService.checkTravelActivityOwnerAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<BookingResponseDTO>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Travel activity owner access required")
                        .build());
            }
            
            BookingResponseDTO completedBooking = bookingService.markBookingAsCompletedByOwnerToken(bookingId, token);
            
            ResponseDTO<BookingResponseDTO> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Booking marked as completed successfully");
            response.setData(completedBooking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking booking {} as completed: ", bookingId, e);
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to mark booking as completed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/owner/bookings/verify-qr")
    public ResponseEntity<ResponseDTO<BookingResponseDTO>> verifyOwnerQRCode(
            @RequestBody Map<String, String> qrData,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Travel activity owner QR code verification request");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String qrCodeData = qrData.get("qrCodeData");
        
        if (qrCodeData == null || qrCodeData.isEmpty()) {
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("BAD_REQUEST");
            errorResponse.setMessage("QR code data is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            // Verify token and check travel activity owner access
            ResponseDTO accessCheck = adminService.checkTravelActivityOwnerAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<BookingResponseDTO>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Travel activity owner access required")
                        .build());
            }
            
            BookingResponseDTO verificationResult = bookingService.verifyQRCodeByOwnerToken(qrCodeData, token);
            
            ResponseDTO<BookingResponseDTO> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("QR code verified successfully");
            response.setData(verificationResult);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verifying QR code: ", e);
            ResponseDTO<BookingResponseDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("QR code verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // Admin Notification Management Endpoints
    
    @PostMapping("/notifications")
    public ResponseEntity<ResponseDTO<NotificationDTO>> createNotification(
            @RequestBody CreateNotificationDTO createDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Admin request to create notification: {}", createDTO.getTitle());
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify admin access
            ResponseDTO accessCheck = adminService.checkAdminAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<NotificationDTO>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Admin access required")
                        .build());
            }
            
            // Get admin user ID from token
            String decodedToken = new String(java.util.Base64.getDecoder().decode(token));
            String[] parts = decodedToken.split(":");
            int adminUserId = Integer.parseInt(parts[0]);
            
            NotificationDTO notification = notificationService.createNotification(createDTO, adminUserId);
            
            ResponseDTO<NotificationDTO> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Notification created successfully");
            response.setData(notification);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating notification: ", e);
            ResponseDTO<NotificationDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to create notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/notifications")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Admin request to get all notifications");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify admin access
            ResponseDTO accessCheck = adminService.checkAdminAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<Map<String, Object>>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Admin access required")
                        .build());
            }
            
            Page<NotificationDTO> notifications = notificationService.getAllNotificationsForAdmin(page, size);
            
            Map<String, Object> responseData = Map.of(
                    "notifications", notifications.getContent(),
                    "totalElements", notifications.getTotalElements(),
                    "totalPages", notifications.getTotalPages(),
                    "currentPage", page
            );
            
            ResponseDTO<Map<String, Object>> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Notifications retrieved successfully");
            response.setData(responseData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching notifications: ", e);
            ResponseDTO<Map<String, Object>> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to fetch notifications: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PutMapping("/notifications/{notificationId}")
    public ResponseEntity<ResponseDTO<NotificationDTO>> updateNotification(
            @PathVariable Long notificationId,
            @RequestBody CreateNotificationDTO updateDTO,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Admin request to update notification ID: {}", notificationId);
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify admin access
            ResponseDTO accessCheck = adminService.checkAdminAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<NotificationDTO>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Admin access required")
                        .build());
            }
            
            NotificationDTO notification = notificationService.updateNotification(notificationId, updateDTO);
            
            ResponseDTO<NotificationDTO> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Notification updated successfully");
            response.setData(notification);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating notification: ", e);
            ResponseDTO<NotificationDTO> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to update notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @DeleteMapping("/notifications/{notificationId}")
    public ResponseEntity<ResponseDTO<Void>> deleteNotification(
            @PathVariable Long notificationId,
            @RequestHeader("Authorization") String authHeader) {
        log.info("Admin request to delete notification ID: {}", notificationId);
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Verify admin access
            ResponseDTO accessCheck = adminService.checkAdminAccess(token);
            if (!accessCheck.getStatus().equals(HttpStatus.OK.toString())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ResponseDTO.<Void>builder()
                        .status(HttpStatus.FORBIDDEN.toString())
                        .message("Unauthorized: Admin access required")
                        .build());
            }
            
            notificationService.deleteNotification(notificationId);
            
            ResponseDTO<Void> response = new ResponseDTO<>();
            response.setStatus("OK");
            response.setMessage("Notification deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting notification: ", e);
            ResponseDTO<Void> errorResponse = new ResponseDTO<>();
            errorResponse.setStatus("ERROR");
            errorResponse.setMessage("Failed to delete notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/notifications/types")
    public ResponseEntity<ResponseDTO<Notification.NotificationType[]>> getNotificationTypes() {
        ResponseDTO<Notification.NotificationType[]> response = new ResponseDTO<>();
        response.setStatus("OK");
        response.setMessage("Notification types retrieved successfully");
        response.setData(Notification.NotificationType.values());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/notifications/target-types")
    public ResponseEntity<ResponseDTO<Notification.TargetUserType[]>> getTargetUserTypes() {
        ResponseDTO<Notification.TargetUserType[]> response = new ResponseDTO<>();
        response.setStatus("OK");
        response.setMessage("Target user types retrieved successfully");
        response.setData(Notification.TargetUserType.values());
        return ResponseEntity.ok(response);
    }
}
