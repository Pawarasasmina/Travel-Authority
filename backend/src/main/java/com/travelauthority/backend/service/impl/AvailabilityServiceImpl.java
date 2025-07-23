package com.travelauthority.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelauthority.backend.dto.AvailabilityCheckRequestDTO;
import com.travelauthority.backend.dto.AvailabilityCheckResponseDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Activity;
import com.travelauthority.backend.entity.Booking;
import com.travelauthority.backend.repository.ActivityRepository;
import com.travelauthority.backend.repository.BookingRepository;
import com.travelauthority.backend.service.AvailabilityService;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@Transactional
public class AvailabilityServiceImpl implements AvailabilityService {

    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public ResponseDTO<AvailabilityCheckResponseDTO> checkAvailability(AvailabilityCheckRequestDTO request) {
        ResponseDTO<AvailabilityCheckResponseDTO> responseDTO = new ResponseDTO<>();
        
        try {
            log.info("Checking availability for activity: {}, date: {}, requestedCount: {}", 
                    request.getActivityId(), request.getDate(), request.getRequestedCount());
            
            // Validate input
            if (request.getActivityId() == null || request.getDate() == null) {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Activity ID and date are required");
                responseDTO.setSuccess(false);
                return responseDTO;
            }
            
            // Validate date format
            LocalDate bookingDate;
            try {
                bookingDate = LocalDate.parse(request.getDate());
            } catch (DateTimeParseException e) {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Invalid date format. Please use YYYY-MM-DD format");
                responseDTO.setSuccess(false);
                return responseDTO;
            }
            
            // Check if date is in the past
            if (bookingDate.isBefore(LocalDate.now())) {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Cannot book for past dates");
                responseDTO.setSuccess(false);
                return responseDTO;
            }
            
            // Find the activity
            Optional<Activity> activityOpt = activityRepository.findById(request.getActivityId());
            if (activityOpt.isEmpty()) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("Activity not found");
                responseDTO.setSuccess(false);
                return responseDTO;
            }
            
            Activity activity = activityOpt.get();
            
            // Get all bookings for this activity on the selected date
            List<Booking> bookings = bookingRepository.findByActivityIdAndBookingDate(
                    activity.getId(), request.getDate());
            
            // Calculate the total number of people already booked for this date
            int totalBookedCount = 0;
            for (Booking booking : bookings) {
                // Only count bookings that are not cancelled
                if (booking.getStatus() != Booking.BookingStatus.CANCELLED) {
                    totalBookedCount += booking.getTotalPersons();
                }
            }
            
            // Get the activity's total availability
            int totalAvailability = activity.getAvailability();
            
            // Calculate available spots
            int availableSpots = Math.max(0, totalAvailability - totalBookedCount);
            
            // Check if there's enough availability for the requested count
            boolean isAvailable = true;
            String message = "Available";
            
            if (request.getRequestedCount() != null && request.getRequestedCount() > availableSpots) {
                isAvailable = false;
                message = "Not enough availability for the requested number of people";
            }
            
            // If all spots are booked, set availability to false
            if (availableSpots <= 0) {
                isAvailable = false;
                message = "This activity is fully booked for the selected date";
            }
            
            // Create response
            AvailabilityCheckResponseDTO availabilityResponse = AvailabilityCheckResponseDTO.builder()
                    .available(isAvailable)
                    .activityId(activity.getId())
                    .date(request.getDate())
                    .totalAvailability(totalAvailability)
                    .bookedCount(totalBookedCount)
                    .availableSpots(availableSpots)
                    .message(message)
                    .build();
            
            responseDTO.setData(availabilityResponse);
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Availability checked successfully");
            responseDTO.setSuccess(true);
            
            log.info("Availability check result for activity: {}, date: {}: available={}, spots={}", 
                    activity.getId(), request.getDate(), isAvailable, availableSpots);
            
        } catch (Exception e) {
            log.error("Error checking availability: ", e);
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error checking availability: " + e.getMessage());
            responseDTO.setSuccess(false);
        }
        
        return responseDTO;
    }
}
