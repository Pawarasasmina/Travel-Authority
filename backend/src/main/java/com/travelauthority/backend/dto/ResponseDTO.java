package com.travelauthority.backend.dto;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor

public class ResponseDTO {

    private Object data;
    private String status;
    private String message;
    

}
