package com.travelauthority.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.travelauthority.backend.entity.Activity;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    // Find all activities where active is true
    List<Activity> findByActiveTrue();
    
    // Find activities by creator
    List<Activity> findByCreatedBy(String createdBy);
    
    // Find active activities by creator
    List<Activity> findByCreatedByAndActiveTrue(String createdBy);
    
    // Count activities by creator
    long countByCreatedBy(String createdBy);
}
