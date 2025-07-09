package com.travelauthority.backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private int id;
    private String title;
    private String location;
    private List<String> images;
    private List<String> keyPoints;
    private String description;
    private boolean active;
    private List<ActivityPackageDTO> packages;
}
