package com.travelauthority.backend.repository;

import com.travelauthority.backend.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Integer> {
    List<Offer> findByActiveTrue();
    List<Offer> findByCreatedBy(String createdBy);
    List<Offer> findBySelectedForHomepageTrue();
    
    // Count offers by creator
    long countByCreatedBy(String createdBy);
    
    // Count selected offers by creator
    long countByCreatedByAndSelectedForHomepageTrue(String createdBy);
}
