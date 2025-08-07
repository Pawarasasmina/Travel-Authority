package com.travelauthority.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRVerificationRequestDTO {
    private String qrCodeData;
    
    @Override
    public String toString() {
        return "QRVerificationRequestDTO{" +
                "qrCodeData='" + (qrCodeData != null ? qrCodeData.substring(0, Math.min(qrCodeData.length(), 100)) + "..." : "null") + '\'' +
                '}';
    }
}
