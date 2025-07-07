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
        String baseUrl = "https://your-domain.netlify.app"; // Netlify 주소로 교체
        String gpsLink = baseUrl + "/gps/agree/" + request.getVehicleId();
        String message = "[GPS 동의 요청]\n아래 링크를 눌러 위치 공유를 허용해주세요.\n" + gpsLink;

        boolean success = smsService.sendSms(request.getPhoneNumber(), message);
        return success
            ? ResponseEntity.ok("문자 발송 성공")
            : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("문자 발송 실패");
    }

}
