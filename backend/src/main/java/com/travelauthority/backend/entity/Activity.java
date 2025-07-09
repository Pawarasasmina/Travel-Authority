package com.travelauthority.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

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
    @ElementCollection
    private List<String> images;
    @ElementCollection
    private List<String> keyPoints;
    @Column(length = 2000)
    private String description;
    private boolean active;

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActivityPackage> packages;
}
