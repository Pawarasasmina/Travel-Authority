package com.travelauthority.backend.service.impl;

import com.travelauthority.backend.dto.OfferDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.Offer;
import com.travelauthority.backend.repository.OfferRepository;
import com.travelauthority.backend.service.OfferService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OfferServiceImpl implements OfferService {

    @Autowired
    private OfferRepository offerRepository;

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
            
            // Preserve the createdBy field if it's being updated
            if (offerDTO.getCreatedBy() != null && !offerDTO.getCreatedBy().isEmpty()) {
                existingOffer.setCreatedBy(offerDTO.getCreatedBy());
            }
            
            // Update active status if provided
            if (offerDTO.getActive() != null) {
                existingOffer.setActive(offerDTO.getActive());
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
    
    // Helper methods to map between DTO and Entity
    private OfferDTO mapToDTO(Offer offer) {
        return OfferDTO.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .image(offer.getImage())
                .discount(offer.getDiscount())
                .active(offer.getActive())
                .createdBy(offer.getCreatedBy())
                .build();
    }
    
    private Offer mapToEntity(OfferDTO offerDTO) {
        return Offer.builder()
                .id(offerDTO.getId())
                .title(offerDTO.getTitle())
                .image(offerDTO.getImage())
                .discount(offerDTO.getDiscount())
                .active(offerDTO.getActive() != null ? offerDTO.getActive() : true)
                .createdBy(offerDTO.getCreatedBy())
                .build();
    }
}
