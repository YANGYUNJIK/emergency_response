package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GpsWithVehicleDTO {
    private Long vehicleId;
    private double lat;
    private double lng;
    private long timestamp;

    // 차량 정보
    private String callSign;
    private String vehicleType;
    private String station;
    private String province;
    private String status;

    // ✅ 추가 필드 (프론트에서 사용 중이라면)
    private String capacity;
    private String personnel;
    private String AVL;
    private String PSLTE;
    private String gathering;
}
