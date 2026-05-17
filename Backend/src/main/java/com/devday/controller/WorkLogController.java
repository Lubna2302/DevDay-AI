package com.devday.controller;

import com.devday.dto.CreateWorkLogRequest;
import com.devday.dto.WorkLogDto;
import com.devday.service.WorkLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/work-logs")
@RequiredArgsConstructor
public class WorkLogController {

    private final WorkLogService workLogService;

    @PostMapping
    public ResponseEntity<WorkLogDto> createWorkLog(
            Authentication authentication,
            @Valid @RequestBody CreateWorkLogRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workLogService.createWorkLog(userId, request));
    }

    @GetMapping("/today")
    public ResponseEntity<List<WorkLogDto>> getWorkLogsToday(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(workLogService.getWorkLogsToday(userId));
    }
}
