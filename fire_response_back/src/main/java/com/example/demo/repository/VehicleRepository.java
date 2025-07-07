package com.example.demo.repository;

import com.example.demo.model.Vehicle;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByAvl(String avl); // ✅ 이 메서드 추가
    // 🔄 모든 차량의 상태를 특정 값으로 일괄 변경
    @Modifying
    @Query("UPDATE Vehicle v SET v.status = :status")
    int updateAllVehicleStatus(@Param("status") String status);
    
}
