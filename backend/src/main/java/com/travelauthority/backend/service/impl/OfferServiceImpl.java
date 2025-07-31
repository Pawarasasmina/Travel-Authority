package com.travelauthority.backend.service.impl;

import com.travelauthority.backend.dto.OfferDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Offer;
import com.travelauthority.backend.repository.OfferRepository;
import com.travelauthority.backend.service.OfferService;
import com.travelauthority.backend.service.NotificationService;
import com.travelauthority.backend.dto.CreateNotificationDTO;
import com.travelauthority.backend.entity.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@Slf4j
public class OfferServiceImpl implements OfferService {

    @Autowired
    private OfferRepository offerRepository;

    // Add NotificationService (not autowired to avoid circular dependency)
    private NotificationService notificationService;

    @Override
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public ResponseDTO<OfferDTO> saveOffer(OfferDTO offerDTO) {
        ResponseDTO<OfferDTO> responseDTO = new ResponseDTO<>();
        
        try {
            Offer offer = mapToEntity(offerDTO);
            offer.setActive(true); // Default to active when created
            
            Offer savedOffer = offerRepository.save(offer);
            
            responseDTO.setStatus(HttpStatus.CREATED.toString());
            responseDTO.setMessage("Offer created successfully");
            responseDTO.setData(mapToDTO(savedOffer));
            
            // --- Send notification for new offer ---
            if (notificationService != null) {
                CreateNotificationDTO notification = CreateNotificationDTO.builder()
                    .title("New Offer: " + savedOffer.getTitle())
                    .message("A new offer has been added: " + savedOffer.getTitle() +
                        (savedOffer.getDiscountPercentage() != null ? " (" + savedOffer.getDiscountPercentage() + "% OFF)" : ""))
                    .type(Notification.NotificationType.OFFER)
                    .targetUserType(Notification.TargetUserType.ALL_USERS)
                    .actionUrl("/offers/" + savedOffer.getId())
                    .iconUrl(savedOffer.getImage())
                    .build();
                // Use null for createdByUserId (system user will be picked inside NotificationService)
                notificationService.createNotification(notification, null);
            }
            // --- end notification ---

            return responseDTO;
        } catch (Exception e) {
            log.error("Error creating offer: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error creating offer: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO<List<OfferDTO>> getAllOffers() {
        ResponseDTO<List<OfferDTO>> responseDTO = new ResponseDTO<>();
        
        try {
            List<Offer> offers = offerRepository.findAll();
            List<OfferDTO> offerDTOs = offers.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("All offers retrieved successfully");
            responseDTO.setData(offerDTOs);
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving all offers: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error retrieving all offers: " + e.getMessage());
            return responseDTO;
        }
    }
    
    @Override
    public ResponseDTO<List<OfferDTO>> getActiveOffers() {
        ResponseDTO<List<OfferDTO>> responseDTO = new ResponseDTO<>();
        
        try {
            List<Offer> offers = offerRepository.findByActiveTrue();
            List<OfferDTO> offerDTOs = offers.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Active offers retrieved successfully");
            responseDTO.setData(offerDTOs);
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving active offers: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error retrieving active offers: " + e.getMessage());
            return responseDTO;
        }
    }
    
    @Override
    public ResponseDTO<List<OfferDTO>> getOffersByOwner(String ownerEmail) {
        ResponseDTO<List<OfferDTO>> responseDTO = new ResponseDTO<>();
        
        try {
            List<Offer> offers = offerRepository.findByCreatedBy(ownerEmail);
            List<OfferDTO> offerDTOs = offers.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Owner offers retrieved successfully");
            responseDTO.setData(offerDTOs);
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving owner offers: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error retrieving owner offers: " + e.getMessage());
            return responseDTO;
        }
    }
    
    @Override
    public ResponseDTO<List<OfferDTO>> getSelectedOffers() {
        ResponseDTO<List<OfferDTO>> responseDTO = new ResponseDTO<>();
        
        try {
            List<Offer> offers = offerRepository.findBySelectedForHomepageTrue();
            List<OfferDTO> offerDTOs = offers.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Selected homepage offers retrieved successfully");
            responseDTO.setData(offerDTOs);
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving selected homepage offers: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error retrieving selected homepage offers: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO<OfferDTO> getOfferById(int id) {
        ResponseDTO<OfferDTO> responseDTO = new ResponseDTO<>();
        
        try {
            Optional<Offer> offerOptional = offerRepository.findById(id);
            
            if (offerOptional.isEmpty()) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("Offer not found with ID: " + id);
                return responseDTO;
            }
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Offer retrieved successfully");
            responseDTO.setData(mapToDTO(offerOptional.get()));
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving offer: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error retrieving offer: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO<OfferDTO> updateOffer(int id, OfferDTO offerDTO) {
        ResponseDTO<OfferDTO> responseDTO = new ResponseDTO<>();
        
        try {
            Optional<Offer> offerOptional = offerRepository.findById(id);
            
            if (offerOptional.isEmpty()) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("Offer not found with ID: " + id);
                return responseDTO;
            }
            
            Offer existingOffer = offerOptional.get();
            existingOffer.setTitle(offerDTO.getTitle());
            existingOffer.setImage(offerDTO.getImage());
            existingOffer.setDiscount(offerDTO.getDiscount());
            
            // Update new fields
            existingOffer.setDiscountPercentage(offerDTO.getDiscountPercentage());
            existingOffer.setActivityId(offerDTO.getActivityId());
            existingOffer.setActivityTitle(offerDTO.getActivityTitle());
            existingOffer.setStartDate(offerDTO.getStartDate());
            existingOffer.setEndDate(offerDTO.getEndDate());
            existingOffer.setSelectedPackages(offerDTO.getSelectedPackages());
            existingOffer.setDescription(offerDTO.getDescription());
            
            // Preserve the createdBy field if it's being updated
            if (offerDTO.getCreatedBy() != null && !offerDTO.getCreatedBy().isEmpty()) {
                existingOffer.setCreatedBy(offerDTO.getCreatedBy());
            }
            
            // Update active status if provided
            if (offerDTO.getActive() != null) {
                existingOffer.setActive(offerDTO.getActive());
            }
            
            // Update selectedForHomepage status if provided
            if (offerDTO.getSelectedForHomepage() != null) {
                existingOffer.setSelectedForHomepage(offerDTO.getSelectedForHomepage());
            }
            
            Offer updatedOffer = offerRepository.save(existingOffer);
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Offer updated successfully");
            responseDTO.setData(mapToDTO(updatedOffer));
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error updating offer: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error updating offer: " + e.getMessage());
            return responseDTO;
        }
    }
    
    @Override
    public ResponseDTO<OfferDTO> toggleHomepageSelection(int id, boolean selected) {
        ResponseDTO<OfferDTO> responseDTO = new ResponseDTO<>();
        
        try {
            Optional<Offer> offerOptional = offerRepository.findById(id);
            
            if (offerOptional.isEmpty()) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("Offer not found with ID: " + id);
                return responseDTO;
            }
            
            Offer existingOffer = offerOptional.get();
            existingOffer.setSelectedForHomepage(selected);
            
            Offer updatedOffer = offerRepository.save(existingOffer);
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage(selected 
                ? "Offer selected for homepage successfully" 
                : "Offer removed from homepage successfully");
            responseDTO.setData(mapToDTO(updatedOffer));
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error toggling homepage selection: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error toggling homepage selection: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO<Void> deleteOffer(int id) {
        ResponseDTO<Void> responseDTO = new ResponseDTO<>();
        
        try {
            if (!offerRepository.existsById(id)) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("Offer not found with ID: " + id);
                return responseDTO;
            }
            
            offerRepository.deleteById(id);
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Offer deleted successfully");
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error deleting offer: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error deleting offer: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO<Void> deleteAllOffers() {
        ResponseDTO<Void> responseDTO = new ResponseDTO<>();
        
        try {
            offerRepository.deleteAll();
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("All offers deleted successfully");
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error deleting all offers: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error deleting all offers: " + e.getMessage());
            return responseDTO;
        }
    }
    
    @Override
    public ResponseDTO<OfferDTO> checkPackageOffer(Integer activityId, Long packageId) {
        ResponseDTO<OfferDTO> responseDTO = new ResponseDTO<>();
        
        try {
            if (activityId == null || packageId == null) {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Activity ID and package ID are required");
                return responseDTO;
            }
            
            // Get today's date
            LocalDate today = LocalDate.now();
            
            // Find active offers for this activity and package
            List<Offer> offers = offerRepository.findByActiveTrue()
                .stream()
                .filter(offer -> 
                    // Match activity ID
                    offer.getActivityId() != null && 
                    offer.getActivityId().equals(activityId) &&
                    // Check offer dates
                    offer.getStartDate() != null &&
                    offer.getEndDate() != null &&
                    !today.isBefore(offer.getStartDate()) && 
                    !today.isAfter(offer.getEndDate()) &&
                    // Check selected packages
                    offer.getSelectedPackages() != null &&
                    offer.getSelectedPackages().contains(packageId))
                .collect(Collectors.toList());
            
            if (offers.isEmpty()) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("No active offer found for the specified activity and package");
                return responseDTO;
            }
            
            // Return the best offer (highest discount)
            Offer bestOffer = offers.stream()
                .max((a, b) -> {
                    if (a.getDiscountPercentage() == null) return -1;
                    if (b.getDiscountPercentage() == null) return 1;
                    return Double.compare(a.getDiscountPercentage(), b.getDiscountPercentage());
                })
                .orElse(offers.get(0));
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Offer found for the specified activity and package");
            responseDTO.setData(mapToDTO(bestOffer));
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error checking package offer: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error checking package offer: " + e.getMessage());
            return responseDTO;
        }
    }
    
    // Helper methods to map between DTO and Entity
    private OfferDTO mapToDTO(Offer offer) {
        return OfferDTO.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .image(offer.getImage())
                .discount(offer.getDiscount())
                .discountPercentage(offer.getDiscountPercentage())
                .active(offer.getActive())
                .selectedForHomepage(offer.getSelectedForHomepage())
                .createdBy(offer.getCreatedBy())
                .activityId(offer.getActivityId())
                .activityTitle(offer.getActivityTitle())
                .startDate(offer.getStartDate())
                .endDate(offer.getEndDate())
                .selectedPackages(offer.getSelectedPackages())
                .description(offer.getDescription())
                .build();
    }
    
    private Offer mapToEntity(OfferDTO offerDTO) {
        return Offer.builder()
                .id(offerDTO.getId())
                .title(offerDTO.getTitle())
                .image(offerDTO.getImage())
                .discount(offerDTO.getDiscount())
                .discountPercentage(offerDTO.getDiscountPercentage())
                .active(offerDTO.getActive() != null ? offerDTO.getActive() : true)
                .selectedForHomepage(offerDTO.getSelectedForHomepage() != null ? offerDTO.getSelectedForHomepage() : false)
                .createdBy(offerDTO.getCreatedBy())
                .activityId(offerDTO.getActivityId())
                .activityTitle(offerDTO.getActivityTitle())
                .startDate(offerDTO.getStartDate())
                .endDate(offerDTO.getEndDate())
                .selectedPackages(offerDTO.getSelectedPackages())
                .description(offerDTO.getDescription())
                .build();
    }
}
