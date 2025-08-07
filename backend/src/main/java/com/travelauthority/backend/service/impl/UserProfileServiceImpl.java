package com.travelauthority.backend.service.impl;

import java.util.Optional;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserProfileDTO;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.repository.UserRepository;
import com.travelauthority.backend.service.UserProfileService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserProfileServiceImpl implements UserProfileService {

    @Autowired
    private UserRepository userRepository;
    
    @Override
    public ResponseDTO getUserProfileByToken(String token) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            // Decode token to get user information
            // This is a simple implementation - in a production app you'd likely use JWT
            String decodedToken = new String(Base64.getDecoder().decode(token));
            String[] parts = decodedToken.split(":");
            
            if (parts.length < 2) {
                responseDTO.setMessage("Invalid token format");
                responseDTO.setStatus(HttpStatus.UNAUTHORIZED.toString());
                return responseDTO;
            }
            
            int userId = Integer.parseInt(parts[0]);
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                UserProfileDTO profileDTO = mapUserToProfileDTO(user);
                
                responseDTO.setData(profileDTO);
                responseDTO.setMessage("Profile retrieved successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("User not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving user profile: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving user profile");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO updateUserProfile(int userId, UserProfileDTO profileDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Update user fields if they're not null in the DTO
                if (profileDTO.getFirstName() != null && profileDTO.getLastName() != null) {
                    user.setFirstName(profileDTO.getFirstName());
                    user.setLastName(profileDTO.getLastName());
                }
                
                if (profileDTO.getEmail() != null) {
                    user.setEmail(profileDTO.getEmail());
                }
                
                if (profileDTO.getPhoneNumber() != null) {
                    user.setPhoneNumber(profileDTO.getPhoneNumber());
                }
                
                if (profileDTO.getBirthdate() != null) {
                    user.setBirthdate(profileDTO.getBirthdate());
                }
                
                if (profileDTO.getGender() != null) {
                    user.setGender(profileDTO.getGender());
                }
                
                // Save the updated user
                userRepository.save(user);
                
                // Map the updated user to a profile DTO to return
                UserProfileDTO updatedProfile = mapUserToProfileDTO(user);
                
                responseDTO.setData(updatedProfile);
                responseDTO.setMessage("Profile updated successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("User not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
            
            return responseDTO;
        } catch (Exception e) {
            log.error("Error updating user profile: {}", e.getMessage());
            responseDTO.setMessage("Error updating user profile");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }
    
    private UserProfileDTO mapUserToProfileDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setBirthdate(user.getBirthdate());
        dto.setGender(user.getGender());
        dto.setNic(user.getNic());
        return dto;
    }
}
