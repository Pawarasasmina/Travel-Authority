package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.ResponseDTO;

public interface AdminService {
    /**
     * Get dashboard data for admin users
     * @param token Authentication token
     * @return ResponseDTO with dashboard data
     */
    ResponseDTO getDashboardData(String token);
    
    /**
     * Update a user's role
     * @param userId User ID to update
     * @param role New role for the user
     * @return ResponseDTO indicating success or failure
     */
    ResponseDTO updateUserRole(int userId, String role);
    
    /**
     * Check if a user has admin access
     * @param token Authentication token
     * @return ResponseDTO with access status
     */
    ResponseDTO checkAdminAccess(String token);
}
