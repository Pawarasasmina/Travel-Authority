package com.travelauthority.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.travelauthority.backend.dto.AuthDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserDTO;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.repository.UserRepository;
import com.travelauthority.backend.service.AuthService;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    /**
     * Generate a simple token for demonstration purposes.
     * In a production application, this should be replaced with JWT or other secure token system.
     */
    private String generateToken(int userId, String email) {
        // Simple implementation for demo - in production use JWT
        String baseToken = userId + ":" + email + ":" + System.currentTimeMillis();
        return java.util.Base64.getEncoder().encodeToString(baseToken.getBytes());
    }

    @Override
    public ResponseDTO register(UserDTO userDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            // Validation
            if (userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Password is required");
                return responseDTO;
            }
            
            if (!userDTO.getPassword().equals(userDTO.getConfirmPassword())) {
                responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                responseDTO.setMessage("Passwords do not match");
                return responseDTO;
            }
            
            // Check if user already exists
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                responseDTO.setStatus(HttpStatus.CONFLICT.toString());
                responseDTO.setMessage("Email already registered");
                return responseDTO;
            }
            
            if (userRepository.existsByNic(userDTO.getNic())) {
                responseDTO.setStatus(HttpStatus.CONFLICT.toString());
                responseDTO.setMessage("NIC already registered");
                return responseDTO;
            }
            
            if (userRepository.existsByPhoneNumber(userDTO.getPhoneNumber())) {
                responseDTO.setStatus(HttpStatus.CONFLICT.toString());
                responseDTO.setMessage("Phone number already registered");
                return responseDTO;
            }
            
            // Create user
            User user = new User();
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            user.setPhoneNumber(userDTO.getPhoneNumber());
            user.setNic(userDTO.getNic());
            
            // Encrypt password
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            
            User savedUser = userRepository.save(user);
            
            // Return response without password
            UserDTO userResponse = new UserDTO();
            userResponse.setId(savedUser.getId());
            userResponse.setFirstName(savedUser.getFirstName());
            userResponse.setLastName(savedUser.getLastName());
            userResponse.setEmail(savedUser.getEmail());
            userResponse.setPhoneNumber(savedUser.getPhoneNumber());
            userResponse.setNic(savedUser.getNic());
            
            responseDTO.setData(userResponse);
            responseDTO.setStatus(HttpStatus.CREATED.toString());
            responseDTO.setMessage("User registered successfully");
            return responseDTO;
            
        } catch (Exception e) {
            log.error("Error during registration: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Registration failed: " + e.getMessage());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO login(AuthDTO authDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        
        try {
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(authDTO.getEmail());
            
            if (userOptional.isEmpty()) {
                responseDTO.setStatus(HttpStatus.UNAUTHORIZED.toString());
                responseDTO.setMessage("Invalid email or password");
                return responseDTO;
            }
            
            User user = userOptional.get();
            
            // Check password
            if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
                responseDTO.setStatus(HttpStatus.UNAUTHORIZED.toString());
                responseDTO.setMessage("Invalid email or password");
                return responseDTO;
            }
              // Create response with user details (without password)
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            userData.put("email", user.getEmail());
            userData.put("phoneNumber", user.getPhoneNumber());
            userData.put("nic", user.getNic());
            
            // Generate a simple token (this should be replaced with JWT in production)
            String token = generateToken(user.getId(), user.getEmail());
            userData.put("token", token);
            
            responseDTO.setData(userData);
            responseDTO.setStatus(HttpStatus.OK.toString());
            responseDTO.setMessage("Login successful");
            return responseDTO;
            
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            responseDTO.setMessage("Login failed: " + e.getMessage());
            return responseDTO;
        }
    }
}
