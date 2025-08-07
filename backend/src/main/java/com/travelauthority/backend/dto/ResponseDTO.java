package com.travelauthority.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseDTO<T> {
    private T data;
    private String status;
    private String message;
    
    // For the new booking API format
    @Builder.Default
    private Boolean success = true;
    
    // Constructor for backward compatibility
    public ResponseDTO(T data, String status, String message) {
        this.data = data;
        this.status = status;
        this.message = message;
        this.success = "OK".equals(status) || "200 OK".equals(status);
    }
    
    // Static helper methods for creating responses
    public static <T> ResponseDTO<T> success(T data, String message) {
        return ResponseDTO.<T>builder()
                .data(data)
                .message(message)
                .status("OK")
                .success(true)
                .build();
    }
    
    public static <T> ResponseDTO<T> error(String message) {
        return ResponseDTO.<T>builder()
                .message(message)
                .status("ERROR")
                .success(false)
                .build();
    }
}
