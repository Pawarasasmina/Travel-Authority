package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserProfileDTO;
import com.travelauthority.backend.service.UserProfileService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequestMapping("/api/v1/users")
@CrossOrigin
@RestController
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/profile")
    public ResponseEntity<ResponseDTO> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        log.info("Received request to get user profile");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = userProfileService.getUserProfileByToken(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @PutMapping("/{userId}/profile")
    public ResponseEntity<ResponseDTO> updateUserProfile(
            @PathVariable int userId,
            @RequestBody UserProfileDTO profileDTO) {
        
        log.info("Received request to update user profile for user ID: {}", userId);
        ResponseDTO response = userProfileService.updateUserProfile(userId, profileDTO);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
}
