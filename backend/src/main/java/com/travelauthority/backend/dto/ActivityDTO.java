package com.travelauthority.backend.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDTO {
    private int id;
    private String title;
    private String location;
    private String image;
    private double price;
    private int availability;
    private double rating;
    private String description;
    private String duration;
    private String additionalInfo;
    private List<String> highlights;
    private List<String> categories;
    private List<PackageDTO> packages;
    private Boolean active;
    private String createdBy;
}
