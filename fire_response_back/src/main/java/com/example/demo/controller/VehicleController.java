package com.example.demo.controller;

import com.example.demo.model.Vehicle;
import com.example.demo.service.VehicleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
// @CrossOrigin(origins = "*")
public class VehicleController {
    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<Vehicle> getAll() {
        return vehicleService.getAllVehicles();
    }

    @PostMapping
    public Vehicle add(@RequestBody Vehicle vehicle) {
        return vehicleService.saveVehicle(vehicle);
    }

    @DeleteMapping("/{avl}")
    public void delete(@PathVariable String avl) {
        vehicleService.deleteById(avl);
    }

    @PutMapping("/{avl}/status")
    public void updateStatus(@PathVariable String avl, @RequestBody String status) {
        vehicleService.updateStatus(avl, status.replace("\"", ""));
    }

    // ✅ 집결 상태 수정 API 추가
    @PutMapping("/{avl}/jipgyeol")
    public void updateJipgyeol(@PathVariable String avl, @RequestBody String jipgyeol) {
        vehicleService.updateJipgyeol(avl, jipgyeol.replace("\"", ""));
    }

    // 차량 전체 수정 (등록된 차량 정보 전체 덮어쓰기)
    @PutMapping("/{avl}")
    public Vehicle updateVehicle(@PathVariable String avl, @RequestBody Vehicle updated) {
        return vehicleService.updateVehicle(avl, updated);
    }

}
