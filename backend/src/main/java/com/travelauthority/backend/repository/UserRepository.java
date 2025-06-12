package com.travelauthority.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.travelauthority.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Authentication related methods
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNic(String nic);
    boolean existsByPhoneNumber(String phoneNumber);
}
