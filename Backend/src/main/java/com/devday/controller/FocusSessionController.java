package com.devday.controller;

import com.devday.dto.FocusSessionDto;
import com.devday.dto.PauseFocusSessionRequest;
import com.devday.dto.StartFocusSessionRequest;
import com.devday.service.FocusSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/focus-sessions")
@RequiredArgsConstructor
public class FocusSessionController {

    private final FocusSessionService focusSessionService;

    @PostMapping("/start")
    public ResponseEntity<FocusSessionDto> startFocusSession(
            Authentication authentication,
            @Valid @RequestBody StartFocusSessionRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(focusSessionService.startFocusSession(userId, request));
    }

    @GetMapping("/active")
    public ResponseEntity<FocusSessionDto> getActiveSession(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        FocusSessionDto session = focusSessionService.getActiveSession(userId);
        if (session == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<FocusSessionDto> completeFocusSession(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(focusSessionService.completeFocusSession(userId, id));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<FocusSessionDto> pauseFocusSession(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody PauseFocusSessionRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(focusSessionService.pauseFocusSession(userId, id, request));
    }
}
