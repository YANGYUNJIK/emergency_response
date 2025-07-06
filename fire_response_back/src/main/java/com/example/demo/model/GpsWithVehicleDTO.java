package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GpsWithVehicleDTO {
    private double lat;
    private double lng;
    private String callSign;
    private String vehicleType;
    private String station;
    private String province;
    private String status;
}
