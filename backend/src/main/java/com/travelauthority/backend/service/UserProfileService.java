package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserProfileDTO;

public interface UserProfileService {
    ResponseDTO getUserProfileByToken(String token);
    ResponseDTO updateUserProfile(int userId, UserProfileDTO profileDTO);
}
