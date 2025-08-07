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
public class CreateNotificationDTO {
    
    private String title;
    
    private String message;
    
    private Notification.NotificationType type;
    
    private Notification.TargetUserType targetUserType;
    
    private Integer targetUserId; // Required only if targetUserType is SPECIFIC_USER
    
    private LocalDateTime expiresAt;
    
    private String actionUrl;
    
    private String iconUrl;
}
