package com.travelauthority.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.repository.UserRepository;
import com.travelauthority.backend.service.AdminService;

import lombok.extern.slf4j.Slf4j;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public ResponseDTO getDashboardData(String token) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            // Verify token and check admin access
            if (!isAdmin(token)) {
                responseDTO.setStatus(HttpStatus.FORBIDDEN.toString());
                responseDTO.setMessage("Unauthorized: Admin access required");
                return responseDTO;
            }
            
            // Get dashboard statistics
            Map<String, Object> dashboardData = new HashMap<>();
            
            // Count total users
            long totalUsers = userRepository.count();
            dashboardData.put("totalUsers", totalUsers);
            
            // Add more stats as needed
            
            responseDTO.setData(dashboardData);
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Dashboard data retrieved successfully");
            return responseDTO;
            
        } catch (Exception e) {
            log.error("Error retrieving admin dashboard data: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error retrieving dashboard data: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO updateUserRole(int userId, String role) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            // Find the user
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                responseDTO.setMessage("User not found");
                return responseDTO;
            }
            
            User user = userOptional.get();
            
            // Update role
            if ("ADMIN".equalsIgnoreCase(role)) {
                user.setRole(User.Role.ADMIN);
            } else if ("USER".equalsIgnoreCase(role)) {
                user.setRole(User.Role.USER);
            } else {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Invalid role: " + role);
                return responseDTO;
            }
            
            // Save updated user
            userRepository.save(user);
            
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("User role updated successfully");
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            responseDTO.setData(userData);
            
            return responseDTO;
            
        } catch (Exception e) {
            log.error("Error updating user role: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error updating user role: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO checkAdminAccess(String token) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            boolean isAdmin = isAdmin(token);
            
            Map<String, Object> accessData = new HashMap<>();
            accessData.put("isAdmin", isAdmin);
            
            responseDTO.setData(accessData);
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Admin access checked");
            return responseDTO;
            
        } catch (Exception e) {
            log.error("Error checking admin access: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Error checking admin access: " + e.getMessage());
            return responseDTO;
        }
    }
    
    /**
     * Check if the token belongs to an admin user
     */
    private boolean isAdmin(String token) {
        try {
            // Decode token to get user ID
            String decodedToken = new String(Base64.getDecoder().decode(token));
            String[] parts = decodedToken.split(":");
            
            if (parts.length < 2) {
                return false;
            }
            
            int userId = Integer.parseInt(parts[0]);
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return false;
            }
            
            User user = userOptional.get();
            return user.isAdmin();
            
        } catch (Exception e) {
            log.error("Error validating admin token: {}", e.getMessage());
            return false;
        }
    }
}
