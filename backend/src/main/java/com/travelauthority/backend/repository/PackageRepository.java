package com.travelauthority.backend.repository;

import com.travelauthority.backend.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByActivityId(Integer activityId);
    
    @Modifying
    @Query("DELETE FROM Package p WHERE p.activity.id = :activityId")
    void deleteByActivityId(@Param("activityId") Integer activityId);
}
