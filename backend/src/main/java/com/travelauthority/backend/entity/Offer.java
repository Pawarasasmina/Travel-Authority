package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    private String image;
    private String discount;
    private Double discountPercentage;
    
    // Track the creator of the offer
    private String createdBy;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean selectedForHomepage = false;
    
    // Activity specific fields
    private Integer activityId;
    private String activityTitle;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @ElementCollection
    @CollectionTable(name = "offer_selected_packages", 
                    joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "package_id")
    private List<Long> selectedPackages;
    
    @Column(length = 500)
    private String description;
}
