package com.travelauthority.backend.controller;

import com.travelauthority.backend.dto.CreateNotificationDTO;
import com.travelauthority.backend.dto.NotificationDTO;
import com.travelauthority.backend.entity.Notification;
import com.travelauthority.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // Get notifications for the current user
    @GetMapping("/my-notifications")
    public ResponseEntity<?> getMyNotifications(
            @RequestParam Integer userId,
            @RequestParam String userRole,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NotificationDTO> notifications = notificationService.getNotificationsForUserPaged(
                    userId, userRole, page, size);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "data", notifications.getContent(),
                    "totalElements", notifications.getTotalElements(),
                    "totalPages", notifications.getTotalPages(),
                    "currentPage", page
            ));
        } catch (Exception e) {
            log.error("Error fetching notifications: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", "Failed to fetch notifications"));
        }
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestParam Integer userId,
            @RequestParam String userRole) {
        try {
            Long unreadCount = notificationService.getUnreadNotificationCount(userId, userRole);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            log.error("Error fetching unread count: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", "Failed to fetch unread count"));
        }
    }

    // Mark notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Integer userId) {
        try {
            notificationService.markNotificationAsRead(notificationId, userId);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "message", "Notification marked as read"
            ));
        } catch (Exception e) {
            log.error("Error marking notification as read: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", "Failed to mark notification as read"));
        }
    }

    // Mark all notifications as read
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestParam Integer userId) {
        try {
            notificationService.markAllNotificationsAsRead(userId);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "message", "All notifications marked as read"
            ));
        } catch (Exception e) {
            log.error("Error marking all notifications as read: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", "Failed to mark all notifications as read"));
        }
    }

    // Admin endpoints
    @PostMapping("/admin/create")
    public ResponseEntity<?> createNotification(
            @RequestBody CreateNotificationDTO createDTO,
            @RequestParam Integer adminUserId) {
        try {
            NotificationDTO notification = notificationService.createNotification(createDTO, adminUserId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "status", "CREATED",
                            "message", "Notification created successfully",
                            "data", notification
                    ));
        } catch (Exception e) {
            log.error("Error creating notification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllNotificationsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NotificationDTO> notifications = notificationService.getAllNotificationsForAdmin(page, size);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "data", notifications.getContent(),
                    "totalElements", notifications.getTotalElements(),
                    "totalPages", notifications.getTotalPages(),
                    "currentPage", page
            ));
        } catch (Exception e) {
            log.error("Error fetching all notifications: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", "Failed to fetch notifications"));
        }
    }

    @PutMapping("/admin/{notificationId}")
    public ResponseEntity<?> updateNotification(
            @PathVariable Long notificationId,
            @RequestBody CreateNotificationDTO updateDTO) {
        try {
            NotificationDTO notification = notificationService.updateNotification(notificationId, updateDTO);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "message", "Notification updated successfully",
                    "data", notification
            ));
        } catch (Exception e) {
            log.error("Error updating notification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);

            return ResponseEntity.ok(Map.of(
                    "status", "OK",
                    "message", "Notification deleted successfully"
            ));
        } catch (Exception e) {
            log.error("Error deleting notification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    // Get notification types for dropdown
    @GetMapping("/types")
    public ResponseEntity<?> getNotificationTypes() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "data", Notification.NotificationType.values()
        ));
    }

    // Get target user types for dropdown
    @GetMapping("/target-types")
    public ResponseEntity<?> getTargetUserTypes() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "data", Notification.TargetUserType.values()
        ));
    }
}
