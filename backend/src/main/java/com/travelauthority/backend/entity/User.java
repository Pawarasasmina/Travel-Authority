package com.travelauthority.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    public enum Role {
        USER, ADMIN
    }

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    private int id;
    private String firstName;
    private String lastName;
    
    @Column(unique = true)
    private String email;
    
    private String phoneNumber;
    private String nic;
    private String password;
    private String birthdate;
    private String gender;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER; // Default role
    
    // Helper methods
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
