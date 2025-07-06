package com.example.demo.repository;

import com.example.demo.model.GpsLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;



public interface GpsLocationRepository extends MongoRepository<GpsLocation, String> {
    // 필요 시: List<GpsLocation> findByVehicleId(Long vehicleId);
    List<GpsLocation> findAllByOrderByTimestampDesc();

}
