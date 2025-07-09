package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @ElementCollection
    private List<String> keyIncludes;

    private double priceForeignAdult;
    private double priceForeignKid;
    private double priceLocalAdult;
    private double priceLocalKid;

    private String openingTime;
    private String averageTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;
}
