package com.travelauthority.backend.dto;

import com.travelauthority.backend.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String description;
    private String message;
    private Notification.NotificationType type;
    private Notification.TargetUserType targetUserType;
    private Integer targetUserId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private String actionUrl;
    private String iconUrl;
    private String createdByName;
    private Boolean isRead; // This will be populated based on the user's read status
    private Long unreadCount; // For dashboard stats
}
