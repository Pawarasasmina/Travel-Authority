package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.OfferDTO;
import com.travelauthority.backend.dto.ResponseDTO;

import java.util.List;

public interface OfferService {
    ResponseDTO<OfferDTO> saveOffer(OfferDTO offerDTO);
    ResponseDTO<List<OfferDTO>> getAllOffers();
    ResponseDTO<List<OfferDTO>> getActiveOffers();
    ResponseDTO<OfferDTO> getOfferById(int id);
    ResponseDTO<OfferDTO> updateOffer(int id, OfferDTO offerDTO);
    ResponseDTO<Void> deleteOffer(int id);
    ResponseDTO<Void> deleteAllOffers();
}
