package com.travelauthority.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.travelauthority.backend.dto.AuthDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserDTO;
import com.travelauthority.backend.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseDTO register(@RequestBody UserDTO userDTO) {
        return authService.register(userDTO);
    }

    @PostMapping("/login")
    public ResponseDTO login(@RequestBody AuthDTO authDTO) {
        return authService.login(authDTO);
    }
}
