package com.travelauthority.backend.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageDTO {
    private Long id;
    private String name;
    private String description;
    private Double price; // Base price for backward compatibility
    private Double foreignAdultPrice;
    private Double foreignKidPrice;
    private Double localAdultPrice;
    private Double localKidPrice;
    private List<String> features;
    // Temporarily remove images field
    // private List<String> images;
}
