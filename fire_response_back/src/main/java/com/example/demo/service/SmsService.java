package com.example.demo.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {

    public boolean sendSms(String phoneNumber, String message) {
        // 📌 나중에 실제 문자 API 연동 예정
        System.out.println("[문자 전송] " + phoneNumber + " → " + message);
        return true; // 항상 성공했다고 가정
    }
}
