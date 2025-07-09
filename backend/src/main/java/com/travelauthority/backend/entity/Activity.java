package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    
    private String duration;
    
    @Column(length = 2000)
    private String additionalInfo;
    
    @ElementCollection
    @CollectionTable(name = "activity_highlights", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "highlight")
    private List<String> highlights;
    
    @ElementCollection
    @CollectionTable(name = "activity_categories", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "category")
    private List<String> categories;
    
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Package> packages;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
