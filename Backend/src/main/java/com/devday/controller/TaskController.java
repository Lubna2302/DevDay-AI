package com.devday.controller;

import com.devday.dto.CreateTaskRequest;
import com.devday.dto.TaskDto;
import com.devday.dto.UpdateTaskStatusRequest;
import com.devday.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskDto> createTask(
            Authentication authentication,
            @Valid @RequestBody CreateTaskRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(userId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(taskService.updateTaskStatus(userId, id, request));
    }
}
