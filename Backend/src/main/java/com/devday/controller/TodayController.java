package com.devday.controller;

import com.devday.dto.TodayDataDto;
import com.devday.service.TodayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/today")
@RequiredArgsConstructor
public class TodayController {

    private final TodayService todayService;

    @GetMapping
    public ResponseEntity<TodayDataDto> getTodayData(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(todayService.getTodayData(userId));
    }
}
