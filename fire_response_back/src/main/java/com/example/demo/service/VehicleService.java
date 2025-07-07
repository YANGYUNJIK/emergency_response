package com.example.demo.service;

import com.example.demo.model.Vehicle;
import com.example.demo.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;

    // ✅ 추가된 메서드
    @Transactional
    public void updateStatusByAvl(String avl, String status) {
        Vehicle vehicle = vehicleRepository.findByAvl(avl)
            .orElseThrow(() -> new RuntimeException("해당 AVL의 차량이 없습니다."));
        vehicle.setStatus(status);
        vehicle.setConfirm("성공");
        vehicleRepository.save(vehicle);
    }

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public int setAllVehiclesStatusTo(String status) {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        int updatedCount = 0;
        for (Vehicle v : vehicles) {
            v.setStatus(status);
            if ("대기".equals(status)) {
                v.setConfirm("미전송");
            }
            vehicleRepository.save(v);
            updatedCount++;
        }
        return updatedCount;
    }


    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public void deleteById(Long id) {
        vehicleRepository.deleteById(id);
    }

    public void updateStatus(Long id, String newStatus) {
        Optional<Vehicle> optional = vehicleRepository.findById(id);
        optional.ifPresent(v -> {
            v.setStatus(newStatus);
            // ✅ 상태가 '대기'일 경우 confirm 초기화
            if ("대기".equals(newStatus)) {
                v.setConfirm("미전송");
            }
            vehicleRepository.save(v);
        });
    }

    public void updateGathering(Long id, String newGathering) {
        Optional<Vehicle> optional = vehicleRepository.findById(id);
        optional.ifPresent(v -> {
            v.setGathering(newGathering);
            vehicleRepository.save(v);
        });
    }

    public Vehicle updateVehicle(Long id, Vehicle updated) {
        Optional<Vehicle> optional = vehicleRepository.findById(id);
        if (optional.isPresent()) {
            Vehicle v = optional.get();
            v.setProvince(updated.getProvince());
            v.setStation(updated.getStation());
            v.setVehicleType(updated.getVehicleType());
            v.setCallSign(updated.getCallSign());
            v.setCapacity(updated.getCapacity());
            v.setPersonnel(updated.getPersonnel());
            v.setPslte(updated.getPslte());
            v.setAvl(updated.getAvl());
            v.setGathering(updated.getGathering());
            v.setStatus(updated.getStatus());
            v.setConfirm(updated.getConfirm());
            return vehicleRepository.save(v);
        } else {
            throw new RuntimeException("수정 대상 차량이 존재하지 않음: " + id);
        }
    }
}
