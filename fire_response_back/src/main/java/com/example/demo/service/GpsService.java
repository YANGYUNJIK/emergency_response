package com.example.demo.service;

import com.example.demo.model.GpsWithVehicleDTO;
import com.example.demo.model.GpsLocation;
import com.example.demo.model.Vehicle;
import com.example.demo.repository.GpsLocationRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GpsService {
    private final GpsLocationRepository gpsLocationRepository;
    private final VehicleRepository vehicleRepository;

    public GpsService(GpsLocationRepository gpsLocationRepository, VehicleRepository vehicleRepository) {
        this.gpsLocationRepository = gpsLocationRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // ✅ 중복 방지 GPS 저장
    public void saveGpsLocation(GpsLocation location) {
        boolean exists = gpsLocationRepository.existsByVehicleIdAndLatAndLngAndTimestamp(
            location.getVehicleId(), location.getLat(), location.getLng(), location.getTimestamp()
        );

        if (!exists) {
            gpsLocationRepository.save(location);
        } else {
            System.out.println("🚫 중복 GPS 데이터, 저장 생략됨");
        }
    }

    public List<GpsWithVehicleDTO> getAllWithVehicleData() {
        List<GpsWithVehicleDTO> result = new ArrayList<>();

        for (GpsLocation gps : gpsLocationRepository.findAll()) {
            Vehicle vehicle = vehicleRepository.findById(gps.getVehicleId()).orElse(null);

            GpsWithVehicleDTO dto = new GpsWithVehicleDTO();
            dto.setVehicleId(gps.getVehicleId());    // ✅ vehicleId 설정
            dto.setTimestamp(gps.getTimestamp());     // ✅ timestamp 설정
            dto.setLat(gps.getLat());
            dto.setLng(gps.getLng());

            if (vehicle != null) {
                dto.setCallSign(vehicle.getCallSign());
                dto.setVehicleType(vehicle.getVehicleType());
                dto.setStation(vehicle.getStation());
                dto.setProvince(vehicle.getProvince());
                dto.setStatus(vehicle.getStatus());
            }

            result.add(dto);
        }

        return result;
    }
}
