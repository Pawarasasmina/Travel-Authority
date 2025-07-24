package com.travelauthority.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferDTO {
    private int id;
    private String title;
    private String image;
    private String discount;
    private Boolean active;
    private Boolean selectedForHomepage;
    private String createdBy;
}
