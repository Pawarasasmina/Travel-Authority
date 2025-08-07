package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    public enum NotificationType {
        OFFER, ALERT, UPDATE, SYSTEM, BOOKING_CONFIRMATION, PAYMENT_SUCCESS
    }

    public enum TargetUserType {
        ALL_USERS, NORMAL_USERS, ACTIVITY_OWNERS, SPECIFIC_USER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetUserType targetUserType;

    @Column(name = "target_user_id")
    private Integer targetUserId; // For specific user notifications

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Additional metadata
    @Column
    private String actionUrl; // URL to redirect when notification is clicked

    @Column
    private String iconUrl; // Custom icon URL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    // For tracking read status per user
    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserNotificationStatus> userNotificationStatuses;
}
