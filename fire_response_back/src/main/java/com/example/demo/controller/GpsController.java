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

    // ✅ [신규] GPS 동의 페이지 반환 (HTML)
    @GetMapping("/agree/{vehicleId}")
    public ResponseEntity<String> agreePage(@PathVariable Long vehicleId) {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>GPS 동의</title>
            </head>
            <body>
                <h2>GPS 공유에 동의하시겠습니까?</h2>
                <button onclick="sendLocation()">동의하고 위치 전송</button>
                <p id="status"></p>
                <script>
                    function sendLocation() {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                fetch('/gps/receive', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        vehicleId: %d,
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude
                                    })
                                })
                                .then(response => response.text())
                                .then(data => {
                                    document.getElementById("status").innerText = "위치 전송 완료!";
                                })
                                .catch(error => {
                                    document.getElementById("status").innerText = "위치 전송 실패: " + error;
                                });
                            });
                        } else {
                            alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
                        }
                    }
                </script>
            </body>
            </html>
            """.formatted(vehicleId);

        return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
    }

    // ✅ 위치 수신 API (프론트에서 위치 POST)
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

    // ✅ 단순 전체 위치 데이터
    @GetMapping("/latest")
    public List<GpsLocation> getLatestLocations() {
        return gpsLocationRepository.findAll();
    }

    // ✅ vehicleId 기준 최신 GPS + 차량 정보 병합 데이터
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
