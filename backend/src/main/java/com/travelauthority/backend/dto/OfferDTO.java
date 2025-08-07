package com.travelauthority.backend.dto;

import lombok.*;
import java.util.List;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferDTO {
    private int id;
    private String title;
    private String image;
    private String discount;
    private Double discountPercentage;
    private Boolean active;
    private Boolean selectedForHomepage;
    private String createdBy;
    private Integer activityId;
    private String activityTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> selectedPackages;
    private String description;
}
