package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.LastModifiedDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
// @EntityListeners(org.springframework.data.jpa.domain.support.AuditingEntityListener.class)
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("province")
    private String province;

    @JsonProperty("station")
    private String station;

    @JsonProperty("vehicleType")
    private String vehicleType;

    @JsonProperty("callSign")
    private String callSign;

    @JsonProperty("capacity")
    private String capacity;

    @JsonProperty("personnel")
    private String personnel;

    @JsonProperty("AVL")
    private String avl;

    @JsonProperty("PSLTE")
    private String pslte;

    @JsonProperty("gathering")
    private String gathering;

    @JsonProperty("status")
    private String status;

    @JsonProperty("confirm")
    private String confirm;

    // @LastModifiedDate
    // @Column(name = "updated_at")
    // private LocalDateTime updatedAt;
}
