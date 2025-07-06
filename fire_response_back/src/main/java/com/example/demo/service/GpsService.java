
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
    private final GpsLocationRepository GpsLocationRepository;
    private final VehicleRepository vehicleRepository;

    public GpsService(GpsLocationRepository GpsLocationRepository, VehicleRepository vehicleRepository) {
        this.GpsLocationRepository = GpsLocationRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<GpsWithVehicleDTO> getAllWithVehicleData() {
        List<GpsWithVehicleDTO> result = new ArrayList<>();

        for (GpsLocation gps : GpsLocationRepository.findAll()) {
            Vehicle vehicle = vehicleRepository.findById(gps.getVehicleId()).orElse(null);

            GpsWithVehicleDTO dto = new GpsWithVehicleDTO();
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
