package com.travelauthority.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityCheckRequestDTO {
    private Integer activityId;
    private String date;
    private Integer requestedCount; // Number of people requesting to book
}
