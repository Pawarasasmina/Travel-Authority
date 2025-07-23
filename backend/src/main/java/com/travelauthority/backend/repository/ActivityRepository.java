package com.travelauthority.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.travelauthority.backend.entity.Activity;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    // Find all activities where active is true
    List<Activity> findByActiveTrue();
}
