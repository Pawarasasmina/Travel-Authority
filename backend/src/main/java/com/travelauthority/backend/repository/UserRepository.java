package com.travelauthority.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.travelauthority.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    // This interface will automatically provide CRUD operations for the user entity
    // You can add custom query methods here if needed

}
