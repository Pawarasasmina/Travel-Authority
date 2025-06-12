package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    private String location;
    private String image;
    private double price;
    private int availability;
    private double rating;
    @Column(length = 2000)
    private String description;
}
