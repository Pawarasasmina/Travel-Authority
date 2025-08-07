package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.AuthDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import com.travelauthority.backend.dto.UserDTO;

public interface AuthService {
    ResponseDTO register(UserDTO userDTO);
    ResponseDTO login(AuthDTO authDTO);
}
