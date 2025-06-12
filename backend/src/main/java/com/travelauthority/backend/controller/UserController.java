package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserDTO;
import com.travelauthority.backend.service.UserService;

@RequestMapping("/api/v1/user")
@CrossOrigin
@RestController
public class UserController {

    @Autowired
    private UserService userService;


   @PostMapping("/save")
    public ResponseDTO saveUsers(@RequestBody UserDTO userDTO) {
        return userService.saveUser(userDTO);
    }

    @GetMapping("/all")
    public ResponseDTO getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseDTO getUserById(@PathVariable int id) {
        return userService.getUserById(id);
    }

    @PutMapping("/update/{id}")
    public ResponseDTO updateUser(@PathVariable int id, @RequestBody UserDTO userDTO) {
        return userService.updateUser(id, userDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseDTO deleteUser(@PathVariable int id) {
        return userService.deleteUser(id);
    }
}
