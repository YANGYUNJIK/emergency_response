package com.example.demo.service;

import com.example.demo.model.Vehicle;
import com.example.demo.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // 전체 차량 조회
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // 등록
    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // 삭제
    public void deleteById(String avl) {
        vehicleRepository.deleteById(avl);
    }

    // 상태 변경
    public void updateStatus(String avl, String newStatus) {
        Optional<Vehicle> optional = vehicleRepository.findById(avl);
        optional.ifPresent(v -> {
            v.setStatus(newStatus);
            vehicleRepository.save(v);
        });
    }

    // 🔄 집결 상태 변경 (프론트에서 "O" 또는 "X" 값을 전달받음)
    public void updateJipgyeol(String avl, String newJipgyeol) {
        Optional<Vehicle> optional = vehicleRepository.findById(avl);
        optional.ifPresent(v -> {
            v.set집결(newJipgyeol);
            vehicleRepository.save(v);
        });
    }

    // 차량 전체 수정
    public Vehicle updateVehicle(String avl, Vehicle updated) {
        Optional<Vehicle> optional = vehicleRepository.findById(avl);
        if (optional.isPresent()) {
            Vehicle v = optional.get();
            v.set시도(updated.get시도());
            v.set소방서(updated.get소방서());
            v.set차종(updated.get차종());
            v.set호출명(updated.get호출명());
            v.set용량(updated.get용량());
            v.set인원(updated.get인원());
            v.setPSLTE(updated.getPSLTE());
            v.set집결(updated.get집결());
            v.setStatus(updated.getStatus());
            return vehicleRepository.save(v);
        } else {
            throw new RuntimeException("수정 대상 차량이 존재하지 않음: " + avl);
        }
    }

}
