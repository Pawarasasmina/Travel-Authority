package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.travelauthority.backend.dto.AvailabilityCheckRequestDTO;
import com.travelauthority.backend.dto.AvailabilityCheckResponseDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.service.AvailabilityService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/activity")
@CrossOrigin
@Slf4j
public class AvailabilityController {
    
    @Autowired
    private AvailabilityService availabilityService;
    
    @GetMapping("/check-availability")
    public ResponseDTO<AvailabilityCheckResponseDTO> checkAvailability(
            @RequestParam Integer activityId,
            @RequestParam(required = false) Integer packageId,
            @RequestParam String date) {
        
        log.info("Checking availability - activityId: {}, packageId: {}, date: {}", activityId, packageId, date);
        
        AvailabilityCheckRequestDTO request = new AvailabilityCheckRequestDTO();
        request.setActivityId(activityId);
        request.setDate(date);
        // For this check, we're just checking if there's any availability
        request.setRequestedCount(1);
        
        return availabilityService.checkAvailability(request);
    }
}
