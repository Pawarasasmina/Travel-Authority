package com.travelauthority.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Package {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price; // Base price for backward compatibility

    // Package-specific availability count
    @Column(nullable = false)
    @Builder.Default
    private Integer availability = 0;

    // Specific pricing for different person types
    @Column(nullable = true)
    private Double foreignAdultPrice;

    @Column(nullable = true)
    private Double foreignKidPrice;

    @Column(nullable = true)
    private Double localAdultPrice;

    @Column(nullable = true)
    private Double localKidPrice;

    @ElementCollection
    @CollectionTable(name = "package_features", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "feature")
    private List<String> features;

    // Temporarily comment out images to fix 500 error
    // @ElementCollection(fetch = FetchType.LAZY)
    // @CollectionTable(name = "package_images", joinColumns = @JoinColumn(name = "package_id"))
    // @Column(name = "image_url", length = 500)
    // @Builder.Default
    // private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    @JsonIgnore
    private Activity activity;
}
