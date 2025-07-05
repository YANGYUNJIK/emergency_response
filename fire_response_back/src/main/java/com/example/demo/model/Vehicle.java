package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// 상단에 import 추가
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;


// 🔹 Lombok을 사용하면 getter/setter 자동 생성됨
@Getter
@Setter
@Entity
@Table(name = "vehicles") // DB 테이블명
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    private Long id;

    @JsonProperty("시도")
    private String 시도;

    @JsonProperty("소방서")
    private String 소방서;

    @JsonProperty("차종")
    private String 차종;

    @JsonProperty("호출명")
    private String 호출명;

    @JsonProperty("용량")
    private String 용량;

    @JsonProperty("인원")
    private String 인원;

    @JsonProperty("AVL") // JSON에서 "AVL" → 자바의 AVL 필드에 매핑
    private String AVL;

    @JsonProperty("PSLTE")
    private String PSLTE;

    @JsonProperty("집결")
    private String 집결;

    @JsonProperty("status")
    private String status;
}
