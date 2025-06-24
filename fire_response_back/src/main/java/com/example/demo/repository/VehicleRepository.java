package com.example.demo.repository;

import com.example.demo.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// 🔹 CRUD 기능을 자동으로 만들어주는 인터페이스
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    // AVL이 Primary Key (String)
}
