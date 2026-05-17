package com.devday.controller;

import com.devday.dto.DailySummaryDto;
import com.devday.dto.WeeklySummaryDto;
import com.devday.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI-generated summaries
 */
@RestController
@RequestMapping("/summaries")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    /**
     * Generate AI-powered daily summary from today's work
     */
    @PostMapping("/daily/generate")
    public ResponseEntity<DailySummaryDto> generateDailySummary(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DailySummaryDto summary = summaryService.generateDailySummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Generate AI-powered weekly summary from this week's work
     */
    @PostMapping("/weekly/generate")
    public ResponseEntity<WeeklySummaryDto> generateWeeklySummary(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        WeeklySummaryDto summary = summaryService.generateWeeklySummary(userId);
        return ResponseEntity.ok(summary);
    }
}

// Made with Bob