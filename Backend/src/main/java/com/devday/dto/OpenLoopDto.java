package com.devday.dto;

import com.devday.entity.OpenLoop;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * OpenLoop DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenLoopDto {
    private String id;
    private String taskId;
    private String taskTitle;
    private String status;
    private String currentState;
    private String nextAction;
    private String blocker;
    private String createdAt; // ISO 8601

    public static OpenLoopDto fromEntity(OpenLoop openLoop) {
        return OpenLoopDto.builder()
                .id(openLoop.getId().toString())
                .taskId(openLoop.getFromTask().getId().toString())
                .taskTitle(openLoop.getFromTask().getTitle())
                .status(mapStatus(openLoop.getStatus()))
                .currentState(openLoop.getContext())
                .nextAction(openLoop.getReason())
                .blocker(null) // Can be enhanced later
                .createdAt(openLoop.getCreatedAt().toString())
                .build();
    }

    private static String mapStatus(OpenLoop.OpenLoopStatus status) {
        return switch (status) {
            case OPEN -> "paused";
            case CLOSED -> "waiting";
            case ABANDONED -> "missing_next_action";
        };
    }
}

// Made with Bob