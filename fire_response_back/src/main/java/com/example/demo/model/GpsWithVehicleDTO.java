package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GpsWithVehicleDTO {
    private Long vehicleId;     // ✅ vehicleId 추가
    private double lat;
    private double lng;
    private long timestamp;     // ✅ timestamp 추가

    private String callSign;
    private String vehicleType;
    private String station;
    private String province;
    private String status;
}
