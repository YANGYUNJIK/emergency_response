package com.example.demo.controller;

import com.example.demo.model.Vehicle;
import com.example.demo.repository.VehicleRepository;
import com.example.demo.service.VehicleService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;


import java.util.List;



@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @PutMapping("/{id}/confirm")
    public ResponseEntity<String> updateConfirm(@PathVariable Long id, @RequestBody String confirm) {
        Optional<Vehicle> optionalVehicle = vehicleRepository.findById(id);
        if (optionalVehicle.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Vehicle vehicle = optionalVehicle.get();
        vehicle.setConfirm(confirm);
        vehicleRepository.save(vehicle);
        return ResponseEntity.ok("Confirm updated");
    }

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // 전체 조회
    @GetMapping
    public List<Vehicle> getAll() {
        return vehicleService.getAllVehicles();
    }

    // 등록
    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle) {
        return vehicleService.saveVehicle(vehicle);
    }

    // 삭제 (id 기준으로 변경)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        vehicleService.deleteById(id);
    }

    // 상태 변경 (id 기준)
    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id, @RequestBody String status) {
        vehicleService.updateStatus(id, status.replace("\"", ""));
    }

    // 집결 상태 변경 (id 기준)
    @PutMapping("/{id}/gathering")
    public void updateGathering(@PathVariable Long id, @RequestBody String gathering) {
        vehicleService.updateGathering(id, gathering.replace("\"", ""));
    }


    // 차량 전체 수정 (id 기준)
    @PutMapping("/{id}")
    public Vehicle updateVehicle(@PathVariable Long id, @RequestBody Vehicle updated) {
        return vehicleService.updateVehicle(id, updated);
    }

    // ✅ 전체 차량 상태 일괄 철수 처리
    @PutMapping("/status/all")
    public ResponseEntity<String> updateAllVehicleStatus(@RequestBody String status) {
        String cleanStatus = status.replace("\"", "");
        int updatedCount = vehicleService.setAllVehiclesStatusTo(cleanStatus);
        return ResponseEntity.ok("✅ 전체 차량 상태를 '" + cleanStatus + "'로 변경 완료 (" + updatedCount + "대)");
    }

}
