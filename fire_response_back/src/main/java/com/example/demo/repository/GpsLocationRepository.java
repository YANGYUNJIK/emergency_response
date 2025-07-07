package com.example.demo.repository;

import com.example.demo.model.GpsLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GpsLocationRepository extends MongoRepository<GpsLocation, String> {
    List<GpsLocation> findAllByOrderByTimestampDesc();

    // ✅ 중복 체크용 메서드
    boolean existsByVehicleIdAndLatAndLngAndTimestamp(Long vehicleId, double lat, double lng, long timestamp);
}
