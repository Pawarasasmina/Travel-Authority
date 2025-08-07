package com.travelauthority.backend.repository;

import com.travelauthority.backend.entity.Notification;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.entity.UserNotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserNotificationStatusRepository extends JpaRepository<UserNotificationStatus, Long> {

    // Find status by notification and user
    Optional<UserNotificationStatus> findByNotificationAndUser(Notification notification, User user);

    // Find all statuses for a user
    List<UserNotificationStatus> findByUserOrderByCreatedAtDesc(User user);

    // Find all statuses for a notification
    List<UserNotificationStatus> findByNotificationOrderByCreatedAtDesc(Notification notification);

    // Check if notification is read by user
    @Query("SELECT uns.isRead FROM UserNotificationStatus uns WHERE uns.notification.id = :notificationId AND uns.user.id = :userId")
    Optional<Boolean> isNotificationReadByUser(@Param("notificationId") Long notificationId, @Param("userId") Integer userId);

    // Count read notifications for a user
    @Query("SELECT COUNT(uns) FROM UserNotificationStatus uns WHERE uns.user.id = :userId AND uns.isRead = true")
    Long countReadNotificationsByUser(@Param("userId") Integer userId);
}
