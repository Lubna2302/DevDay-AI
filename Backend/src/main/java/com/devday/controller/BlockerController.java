package com.devday.controller;

import com.devday.dto.BlockerDto;
import com.devday.dto.CreateBlockerRequest;
import com.devday.service.BlockerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/blockers")
@RequiredArgsConstructor
public class BlockerController {

    private final BlockerService blockerService;

    @PostMapping
    public ResponseEntity<BlockerDto> createBlocker(
            Authentication authentication,
            @Valid @RequestBody CreateBlockerRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(blockerService.createBlocker(userId, request));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<BlockerDto> resolveBlocker(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(blockerService.resolveBlocker(userId, id));
    }
}
