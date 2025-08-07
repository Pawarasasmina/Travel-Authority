package com.travelauthority.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.travelauthority.backend.dto.UserDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.repository.UserRepository;
import com.travelauthority.backend.service.UserService;

import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;
    @Override
    public ResponseDTO saveUser(UserDTO userDTO) {

        ResponseDTO responseDTO = new ResponseDTO();

        try{            User user = new User();

            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            user.setPhoneNumber(userDTO.getPhoneNumber());
            user.setNic(userDTO.getNic());
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            userRepository.save(user); 

            responseDTO.setMessage("User saved successfully");
            responseDTO.setStatus(HttpStatus.CREATED.toString());

            return responseDTO;

        }
        catch (Exception e) {
            log.error(  "Error saving user: {}", e.getMessage());
            responseDTO.setMessage("Error saving user");            
            responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
            return responseDTO;
        }            
    }

    @Override
    public ResponseDTO getAllUsers() {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            List<User> users = userRepository.findAll();
            responseDTO.setData(users);
            responseDTO.setMessage("Users retrieved successfully");
            responseDTO.setStatus(HttpStatus.OK.toString());
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving users: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving users");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }

    @Override
    public ResponseDTO getUserById(int id) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                responseDTO.setData(user.get());
                responseDTO.setMessage("User retrieved successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("User not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
            return responseDTO;
        } catch (Exception e) {
            log.error("Error retrieving user: {}", e.getMessage());
            responseDTO.setMessage("Error retrieving user");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }    @Override
    public ResponseDTO updateUser(int id, UserDTO userDTO) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Optional<User> existingUser = userRepository.findById(id);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                user.setEmail(userDTO.getEmail());                user.setPhoneNumber(userDTO.getPhoneNumber());
                user.setNic(userDTO.getNic());
                if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                    user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                }
                userRepository.save(user);
                responseDTO.setData(user);
                responseDTO.setMessage("User updated successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("User not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
            return responseDTO;
        } catch (Exception e) {
            log.error("Error updating user: {}", e.getMessage());
            responseDTO.setMessage("Error updating user");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }    @Override
    public ResponseDTO deleteUser(int id) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                userRepository.deleteById(id);
                responseDTO.setMessage("User deleted successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
            } else {
                responseDTO.setMessage("User not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
            }
            return responseDTO;
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            responseDTO.setMessage("Error deleting user");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }
      @Override
    public ResponseDTO changePassword(int userId, String currentPassword, String newPassword) {
        ResponseDTO responseDTO = new ResponseDTO();
        try {
            Optional<User> existingUser = userRepository.findById(userId);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                  // Verify current password matches using BCrypt
                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                    log.warn("Password change failed: incorrect current password for user ID: {}", userId);
                    responseDTO.setMessage("Current password is incorrect");
                    responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                    return responseDTO;
                }
                
                // Validate new password
                if (newPassword == null || newPassword.trim().isEmpty()) {
                    responseDTO.setMessage("New password cannot be empty");
                    responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                    return responseDTO;
                }
                
                if (newPassword.length() < 6) {
                    responseDTO.setMessage("Password must be at least 6 characters long");
                    responseDTO.setStatus(HttpStatus.BAD_REQUEST.toString());
                    return responseDTO;
                }
                
                // Update password with proper encryption
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                
                responseDTO.setMessage("Password changed successfully");
                responseDTO.setStatus(HttpStatus.OK.toString());
                log.info("Password changed successfully for user ID: {}", userId);
            } else {
                responseDTO.setMessage("User not found");
                responseDTO.setStatus(HttpStatus.NOT_FOUND.toString());
                log.warn("Password change attempted for non-existent user ID: {}", userId);
            }
            return responseDTO;
        } catch (Exception e) {
            log.error("Error changing password for user ID {}: {}", userId, e.getMessage());
            responseDTO.setMessage("Error changing password");
            responseDTO.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.toString());
            return responseDTO;
        }
    }
}
