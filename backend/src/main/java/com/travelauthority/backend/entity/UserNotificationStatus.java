package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notification_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNotificationStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column
    private LocalDateTime readAt;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Composite unique constraint to prevent duplicate entries
    @Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"notification_id", "user_id"})
    })
    public static class UserNotificationStatusConstraints {}
}
