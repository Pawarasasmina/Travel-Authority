package com.travelauthority.backend.controller;

import com.travelauthority.backend.dto.OfferDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.service.OfferService;
import com.travelauthority.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.List;

@RequestMapping("/api/v1/offers")
@CrossOrigin
@RestController
public class OfferController {

    @Autowired
    private OfferService offerService;

    @Autowired
    private NotificationService notificationService;

    // Wire NotificationService into OfferServiceImpl to avoid circular dependency
    @PostConstruct
    public void init() {
        offerService.setNotificationService(notificationService);
    }

    @PostMapping("/save")
    public ResponseDTO<OfferDTO> saveOffer(@RequestBody OfferDTO offerDTO, @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        // Set the creator information based on the authenticated user
        if (userEmail != null && !userEmail.isEmpty()) {
            offerDTO.setCreatedBy(userEmail);
        } else {
            offerDTO.setCreatedBy("System");
        }
        return offerService.saveOffer(offerDTO);
    }

    @GetMapping("/all")
    public ResponseDTO<List<OfferDTO>> getAllOffers() {
        return offerService.getAllOffers();
    }
    
    @GetMapping("/active")
    public ResponseDTO<List<OfferDTO>> getActiveOffers() {
        return offerService.getActiveOffers();
    }

    @GetMapping("/{id}")
    public ResponseDTO<OfferDTO> getOfferById(@PathVariable int id) {
        return offerService.getOfferById(id);
    }

    @PutMapping("/update/{id}")
    public ResponseDTO<OfferDTO> updateOffer(@PathVariable int id, @RequestBody OfferDTO offerDTO,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        // Preserve creator information if it's being updated
        if (userEmail != null && !userEmail.isEmpty()) {
            offerDTO.setCreatedBy(userEmail);
        }
        return offerService.updateOffer(id, offerDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseDTO<Void> deleteOffer(@PathVariable int id) {
        return offerService.deleteOffer(id);
    }

    @DeleteMapping("/delete/all")
    public ResponseDTO<Void> deleteAllOffers() {
        return offerService.deleteAllOffers();
    }
    
    @GetMapping("/owner/{email}")
    public ResponseDTO<List<OfferDTO>> getOffersByOwner(@PathVariable String email) {
        return offerService.getOffersByOwner(email);
    }
    
    @GetMapping("/check-package")
    public ResponseDTO<OfferDTO> checkPackageOffer(
            @RequestParam Integer activityId,
            @RequestParam Long packageId) {
        return offerService.checkPackageOffer(activityId, packageId);
    }
}
