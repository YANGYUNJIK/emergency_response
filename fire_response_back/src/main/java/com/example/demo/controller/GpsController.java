package com.example.demo.controller;

import com.example.demo.dto.GpsLocationRequest;
import com.example.demo.model.GpsLocation;
import com.example.demo.model.Vehicle;
import com.example.demo.repository.GpsLocationRepository;
import com.example.demo.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/gps")
public class GpsController {

    private final GpsLocationRepository gpsLocationRepository;
    private final VehicleRepository vehicleRepository;

    public GpsController(GpsLocationRepository gpsLocationRepository,
                         VehicleRepository vehicleRepository) {
        this.gpsLocationRepository = gpsLocationRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @PostMapping("/receive")
    public ResponseEntity<String> receiveLocation(@RequestBody GpsLocationRequest request) {
        GpsLocation location = new GpsLocation();
        location.setVehicleId(request.getVehicleId());
        location.setLat(request.getLat());
        location.setLng(request.getLng());
        location.setTimestamp(System.currentTimeMillis());
        gpsLocationRepository.save(location);
        return ResponseEntity.ok("위치 정보가 저장되었습니다.");
    }

    @GetMapping("/latest")
    public List<GpsLocation> getLatestLocations() {
        return gpsLocationRepository.findAll();
    }

    // 🔄 vehicleId 별 최신 GPS 데이터 + 차량 정보 결합 반환
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllGpsWithVehicleInfo() {
        List<GpsLocation> allGps = gpsLocationRepository.findAllByOrderByTimestampDesc();
        Map<Long, GpsLocation> latestGpsMap = new HashMap<>();

        for (GpsLocation gps : allGps) {
            Long vehicleId = gps.getVehicleId();
            if (!latestGpsMap.containsKey(vehicleId)) {
                latestGpsMap.put(vehicleId, gps); // 처음 본 vehicleId의 최신 데이터
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<Long, GpsLocation> entry : latestGpsMap.entrySet()) {
            Long vehicleId = entry.getKey();
            GpsLocation gps = entry.getValue();

            Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
            if (vehicleOpt.isPresent()) {
                Vehicle vehicle = vehicleOpt.get();
                Map<String, Object> data = new HashMap<>();
                data.put("id", vehicle.getId());
                data.put("lat", gps.getLat());
                data.put("lng", gps.getLng());
                data.put("province", vehicle.getProvince());
                data.put("station", vehicle.getStation());
                data.put("callSign", vehicle.getCallSign());
                data.put("vehicleType", vehicle.getVehicleType());
                data.put("capacity", vehicle.getCapacity());
                data.put("AVL", vehicle.getAvl());
                data.put("PSLTE", vehicle.getPslte());
                data.put("status", vehicle.getStatus());
                data.put("personnel", vehicle.getPersonnel());
                data.put("gathering", vehicle.getGathering());
                result.add(data);
            }
        }

        return ResponseEntity.ok(result);
    }
}
