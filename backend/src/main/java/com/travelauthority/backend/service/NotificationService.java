package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.CreateNotificationDTO;
import com.travelauthority.backend.dto.NotificationDTO;
import com.travelauthority.backend.entity.Notification;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.entity.UserNotificationStatus;
import com.travelauthority.backend.repository.NotificationRepository;
import com.travelauthority.backend.repository.UserNotificationStatusRepository;
import com.travelauthority.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationStatusRepository userNotificationStatusRepository;
    private final UserRepository userRepository;

    // Make this method public and allow createdByUserId to be null (use system user if null)
    @Transactional
    public NotificationDTO createNotification(CreateNotificationDTO createDTO, Integer createdByUserId) {
        log.info("Creating notification: {}", createDTO.getTitle());

        User createdBy;
        if (createdByUserId != null) {
            createdBy = userRepository.findById(createdByUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            // Use system user (admin) if not provided
            createdBy = userRepository.findByRole(User.Role.ADMIN).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("System admin user not found"));
        }

        // Validate specific user target
        if (createDTO.getTargetUserType() == Notification.TargetUserType.SPECIFIC_USER) {
            if (createDTO.getTargetUserId() == null) {
                throw new RuntimeException("Target user ID is required for specific user notifications");
            }
            userRepository.findById(createDTO.getTargetUserId())
                    .orElseThrow(() -> new RuntimeException("Target user not found"));
        }

        Notification notification = Notification.builder()
                .title(createDTO.getTitle())
                .message(createDTO.getMessage())
                .type(createDTO.getType())
                .targetUserType(createDTO.getTargetUserType())
                .targetUserId(createDTO.getTargetUserId())
                .expiresAt(createDTO.getExpiresAt())
                .actionUrl(createDTO.getActionUrl())
                .iconUrl(createDTO.getIconUrl())
                .createdBy(createdBy)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", notification.getId());

        return convertToDTO(notification, null);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(Integer userId, String userRole) {
        LocalDateTime currentTime = LocalDateTime.now();
        List<Notification> notifications = notificationRepository.findActiveNotificationsForUser(
                userId, userRole, currentTime);

        return notifications.stream()
                .map(notification -> {
                    boolean isRead = isNotificationReadByUser(notification.getId(), userId);
                    return convertToDTO(notification, isRead);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotificationsForUserPaged(Integer userId, String userRole, int page, int size) {
        LocalDateTime currentTime = LocalDateTime.now();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Notification> notifications = notificationRepository.findActiveNotificationsForUserPaged(
                userId, userRole, currentTime, pageable);

        return notifications.map(notification -> {
            boolean isRead = isNotificationReadByUser(notification.getId(), userId);
            return convertToDTO(notification, isRead);
        });
    }

    @Transactional(readOnly = true)
    public Long getUnreadNotificationCount(Integer userId, String userRole) {
        LocalDateTime currentTime = LocalDateTime.now();
        return notificationRepository.countUnreadNotificationsForUser(userId, userRole, currentTime);
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId, Integer userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserNotificationStatus> existingStatus = 
                userNotificationStatusRepository.findByNotificationAndUser(notification, user);

        if (existingStatus.isPresent()) {
            UserNotificationStatus status = existingStatus.get();
            if (!status.getIsRead()) {
                status.setIsRead(true);
                status.setReadAt(LocalDateTime.now());
                userNotificationStatusRepository.save(status);
                log.info("Marked notification {} as read for user {}", notificationId, userId);
            }
        } else {
            UserNotificationStatus status = UserNotificationStatus.builder()
                    .notification(notification)
                    .user(user)
                    .isRead(true)
                    .readAt(LocalDateTime.now())
                    .build();
            userNotificationStatusRepository.save(status);
            log.info("Created read status for notification {} and user {}", notificationId, userId);
        }
    }

    @Transactional
    public void markAllNotificationsAsRead(Integer userId) {
        String userRole = userRepository.findById(userId)
                .map(user -> user.getRole().name())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime currentTime = LocalDateTime.now();
        List<Notification> notifications = notificationRepository.findActiveNotificationsForUser(
                userId, userRole, currentTime);

        for (Notification notification : notifications) {
            markNotificationAsRead(notification.getId(), userId);
        }
        log.info("Marked all notifications as read for user {}", userId);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getAllNotificationsForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findAllByIsActiveTrueOrderByCreatedAtDesc(pageable);
        
        return notifications.map(notification -> convertToDTO(notification, null));
    }

    @Transactional
    public NotificationDTO updateNotification(Long notificationId, CreateNotificationDTO updateDTO) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setTitle(updateDTO.getTitle());
        notification.setMessage(updateDTO.getMessage());
        notification.setType(updateDTO.getType());
        notification.setTargetUserType(updateDTO.getTargetUserType());
        notification.setTargetUserId(updateDTO.getTargetUserId());
        notification.setExpiresAt(updateDTO.getExpiresAt());
        notification.setActionUrl(updateDTO.getActionUrl());
        notification.setIconUrl(updateDTO.getIconUrl());

        notification = notificationRepository.save(notification);
        log.info("Updated notification with ID: {}", notification.getId());

        return convertToDTO(notification, null);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsActive(false);
        notificationRepository.save(notification);
        log.info("Deactivated notification with ID: {}", notificationId);
    }

    @Transactional
    public void cleanupExpiredNotifications() {
        LocalDateTime currentTime = LocalDateTime.now();
        List<Notification> expiredNotifications = notificationRepository.findExpiredNotifications(currentTime);
        
        for (Notification notification : expiredNotifications) {
            notification.setIsActive(false);
        }
        
        if (!expiredNotifications.isEmpty()) {
            notificationRepository.saveAll(expiredNotifications);
            log.info("Deactivated {} expired notifications", expiredNotifications.size());
        }
    }

    // Helper method to create system notifications
    @Transactional
    public void createSystemNotification(String title, String message, 
                                       Notification.TargetUserType targetType, Integer targetUserId) {
        CreateNotificationDTO createDTO = CreateNotificationDTO.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.SYSTEM)
                .targetUserType(targetType)
                .targetUserId(targetUserId)
                .build();

        // Use system user (admin) as creator
        User systemUser = userRepository.findByRole(User.Role.ADMIN).stream().findFirst()
                .orElse(null);
        
        if (systemUser != null) {
            createNotification(createDTO, systemUser.getId());
        }
    }

    // Helper method to create booking confirmation notifications
    @Transactional
    public void createBookingConfirmationNotification(Integer userId, String activityTitle, String bookingId) {
        String title = "Booking Confirmed";
        String message = String.format("Your booking for %s has been confirmed. Booking ID: %s", 
                                      activityTitle, bookingId);
        
        CreateNotificationDTO createDTO = CreateNotificationDTO.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.BOOKING_CONFIRMATION)
                .targetUserType(Notification.TargetUserType.SPECIFIC_USER)
                .targetUserId(userId)
                .actionUrl("/bookings/" + bookingId)
                .build();

        User systemUser = userRepository.findByRole(User.Role.ADMIN).stream().findFirst()
                .orElse(null);
        
        if (systemUser != null) {
            createNotification(createDTO, systemUser.getId());
        }
    }

    // Helper method to create payment success notifications
    @Transactional
    public void createPaymentSuccessNotification(Integer userId, String activityTitle, String bookingId, Double amount) {
        String title = "Payment Successful";
        String message = String.format("Your payment for %s (Booking ID: %s) was successful. Amount: Rs. %.2f", 
                                      activityTitle, bookingId, amount != null ? amount : 0.0);

        CreateNotificationDTO createDTO = CreateNotificationDTO.builder()
                .title(title)
                .message(message)
                .type(Notification.NotificationType.PAYMENT_SUCCESS)
                .targetUserType(Notification.TargetUserType.SPECIFIC_USER)
                .targetUserId(userId)
                .actionUrl("/bookings/" + bookingId)
                .build();

        User systemUser = userRepository.findByRole(User.Role.ADMIN).stream().findFirst()
                .orElse(null);

        if (systemUser != null) {
            createNotification(createDTO, systemUser.getId());
        }
    }

    private boolean isNotificationReadByUser(Long notificationId, Integer userId) {
        return userNotificationStatusRepository.isNotificationReadByUser(notificationId, userId)
                .orElse(false);
    }

    private NotificationDTO convertToDTO(Notification notification, Boolean isRead) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .targetUserType(notification.getTargetUserType())
                .targetUserId(notification.getTargetUserId())
                .createdAt(notification.getCreatedAt())
                .expiresAt(notification.getExpiresAt())
                .isActive(notification.getIsActive())
                .actionUrl(notification.getActionUrl())
                .iconUrl(notification.getIconUrl())
                .createdByName(notification.getCreatedBy() != null ? 
                    notification.getCreatedBy().getFirstName() + " " + notification.getCreatedBy().getLastName() : 
                    "System")
                .isRead(isRead)
                .build();
    }
}
