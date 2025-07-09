package com.travelauthority.backend.repository;

import com.travelauthority.backend.entity.Booking;
import com.travelauthority.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    
    // Find all bookings for a specific user
    List<Booking> findByUserOrderByBookingTimeDesc(User user);
    
    // Find bookings by status
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    // Find bookings by user and status
    List<Booking> findByUserAndStatusOrderByBookingTimeDesc(User user, Booking.BookingStatus status);
    
    // Find booking by order number
    Optional<Booking> findByOrderNumber(String orderNumber);
    
    // Find bookings by activity ID
    List<Booking> findByActivityIdOrderByBookingTimeDesc(Integer activityId);
    
    // Count bookings by status for admin dashboard
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(@Param("status") Booking.BookingStatus status);
    
    // Get total revenue
    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'CONFIRMED' OR b.status = 'COMPLETED'")
    Double getTotalRevenue();
    
    // Get revenue by activity
    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.activityId = :activityId AND (b.status = 'CONFIRMED' OR b.status = 'COMPLETED')")
    Double getRevenueByActivity(@Param("activityId") Integer activityId);
}
