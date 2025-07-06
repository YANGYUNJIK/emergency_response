package com.example.demo.controller;

import com.example.demo.model.SmsRequest;
import com.example.demo.service.SmsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 🔧 문자 발송 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/sms")
public class SmsController {

    private final SmsService smsService;

    public SmsController(SmsService smsService) {
        this.smsService = smsService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendSms(@RequestBody SmsRequest request) {
        boolean success = smsService.sendSms(request.getPhoneNumber(), request.getMessage());
        return success
            ? ResponseEntity.ok("문자 발송 성공")
            : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("문자 발송 실패");
    }
}
