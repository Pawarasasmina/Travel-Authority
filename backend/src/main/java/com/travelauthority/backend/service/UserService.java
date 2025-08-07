package com.travelauthority.backend.service;

import com.travelauthority.backend.dto.UserDTO;
import com.travelauthority.backend.dto.ResponseDTO;
import java.util.List;

public interface UserService {
    public ResponseDTO saveUser(UserDTO userDTO);
    public ResponseDTO getAllUsers();
    public ResponseDTO getUserById(int id);
    public ResponseDTO updateUser(int id, UserDTO userDTO);
    public ResponseDTO deleteUser(int id);
    public ResponseDTO changePassword(int userId, String currentPassword, String newPassword);
}
