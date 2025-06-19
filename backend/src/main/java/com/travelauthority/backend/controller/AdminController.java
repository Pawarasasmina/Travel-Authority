package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserDTO;
import com.travelauthority.backend.service.AdminService;
import com.travelauthority.backend.service.UserService;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<ResponseDTO> getDashboardData(@RequestHeader("Authorization") String authHeader) {
        log.info("Admin dashboard data request received");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = adminService.getDashboardData(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<ResponseDTO> getAllUsers() {
        log.info("Admin request to get all users");
        ResponseDTO response = userService.getAllUsers();
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ResponseDTO> updateUserRole(@PathVariable int userId, @RequestBody Map<String, String> roleData) {
        log.info("Admin request to update user role for user ID: {}", userId);
        
        String role = roleData.get("role");
        if (role == null) {
            ResponseDTO errorResponse = new ResponseDTO();
            errorResponse.setStatus(HttpStatus.BAD_REQUEST.toString());
            errorResponse.setMessage("Role is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        ResponseDTO response = adminService.updateUserRole(userId, role);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
    
    @GetMapping("/check-admin")
    public ResponseEntity<ResponseDTO> checkAdminAccess(@RequestHeader("Authorization") String authHeader) {
        log.info("Checking admin access");
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        ResponseDTO response = adminService.checkAdminAccess(token);
        
        if (response.getStatus().equals(HttpStatus.OK.toString())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.valueOf(Integer.parseInt(response.getStatus().split(" ")[0]))).body(response);
        }
    }
}
