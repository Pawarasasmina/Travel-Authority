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
    private Long packageId; // ID of the package for which availability is being checked
}
