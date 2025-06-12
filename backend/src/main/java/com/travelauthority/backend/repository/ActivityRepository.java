package com.travelauthority.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.travelauthority.backend.entity.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    // Add custom queries if needed
}
