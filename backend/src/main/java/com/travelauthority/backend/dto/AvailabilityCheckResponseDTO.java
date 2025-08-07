package com.travelauthority.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityCheckResponseDTO {
    private boolean available;
    private Integer activityId;
    private String date;
    private Integer totalAvailability;
    private Integer bookedCount;
    private Integer availableSpots;
    private String message;
}
