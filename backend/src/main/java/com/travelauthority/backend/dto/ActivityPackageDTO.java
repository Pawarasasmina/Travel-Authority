package com.travelauthority.backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityPackageDTO {
    private int id;
    private String name;
    private List<String> keyIncludes;
    private double priceForeignAdult;
    private double priceForeignKid;
    private double priceLocalAdult;
    private double priceLocalKid;
    private String openingTime;
    private String averageTime;
}
