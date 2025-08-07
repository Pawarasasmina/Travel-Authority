package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.AvailabilityCheckRequestDTO;
import com.travelauthority.backend.dto.AvailabilityCheckResponseDTO;
import com.travelauthority.backend.dto.ResponseDTO;

public interface AvailabilityService {
    ResponseDTO<AvailabilityCheckResponseDTO> checkAvailability(AvailabilityCheckRequestDTO request);
}
