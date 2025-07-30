package com.travelauthority.backend.repository;

import com.travelauthority.backend.entity.Notification;
import com.travelauthority.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find active notifications for a specific user
    @Query("SELECT n FROM Notification n WHERE " +
           "(n.targetUserType = 'ALL_USERS' OR " +
           "(n.targetUserType = 'NORMAL_USERS' AND :userRole = 'USER') OR " +
           "(n.targetUserType = 'ACTIVITY_OWNERS' AND :userRole = 'TRAVEL_ACTIVITY_OWNER') OR " +
           "(n.targetUserType = 'SPECIFIC_USER' AND n.targetUserId = :userId)) " +
           "AND n.isActive = true " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :currentTime) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findActiveNotificationsForUser(
            @Param("userId") Integer userId, 
            @Param("userRole") String userRole, 
            @Param("currentTime") LocalDateTime currentTime);

    // Find active notifications for a specific user with pagination
    @Query("SELECT n FROM Notification n WHERE " +
           "(n.targetUserType = 'ALL_USERS' OR " +
           "(n.targetUserType = 'NORMAL_USERS' AND :userRole = 'USER') OR " +
           "(n.targetUserType = 'ACTIVITY_OWNERS' AND :userRole = 'TRAVEL_ACTIVITY_OWNER') OR " +
           "(n.targetUserType = 'SPECIFIC_USER' AND n.targetUserId = :userId)) " +
           "AND n.isActive = true " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :currentTime) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findActiveNotificationsForUserPaged(
            @Param("userId") Integer userId, 
            @Param("userRole") String userRole, 
            @Param("currentTime") LocalDateTime currentTime,
            Pageable pageable);

    // Find unread notifications count for a user
    @Query("SELECT COUNT(n) FROM Notification n LEFT JOIN UserNotificationStatus uns " +
           "ON n.id = uns.notification.id AND uns.user.id = :userId " +
           "WHERE (n.targetUserType = 'ALL_USERS' OR " +
           "(n.targetUserType = 'NORMAL_USERS' AND :userRole = 'USER') OR " +
           "(n.targetUserType = 'ACTIVITY_OWNERS' AND :userRole = 'TRAVEL_ACTIVITY_OWNER') OR " +
           "(n.targetUserType = 'SPECIFIC_USER' AND n.targetUserId = :userId)) " +
           "AND n.isActive = true " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :currentTime) " +
           "AND (uns.isRead IS NULL OR uns.isRead = false)")
    Long countUnreadNotificationsForUser(
            @Param("userId") Integer userId, 
            @Param("userRole") String userRole, 
            @Param("currentTime") LocalDateTime currentTime);

    // Find all active notifications for admin management
    Page<Notification> findAllByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    // Find notifications by type
    List<Notification> findByTypeAndIsActiveTrue(Notification.NotificationType type);

    // Find expired notifications
    @Query("SELECT n FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt <= :currentTime AND n.isActive = true")
    List<Notification> findExpiredNotifications(@Param("currentTime") LocalDateTime currentTime);

    // Find notifications by creator
    List<Notification> findByCreatedByOrderByCreatedAtDesc(User createdBy);
}
