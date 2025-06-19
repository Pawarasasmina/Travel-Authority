package com.travelauthority.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

import com.travelauthority.backend.entity.User;
import com.travelauthority.backend.entity.User.Role;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Authentication related methods
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNic(String nic);
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Admin-related methods
    List<User> findByRole(Role role);
}
