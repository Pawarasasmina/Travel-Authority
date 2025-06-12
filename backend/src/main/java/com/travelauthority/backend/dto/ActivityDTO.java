package com.travelauthority.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private int id;
    private String title;
    private String location;
    private String image;
    private double price;
    private int availability;
    private double rating;
    private String description;
}
