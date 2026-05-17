package com.devday.dto;

import com.devday.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Task DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private String id;
    private String title;
    private String source;
    private String status;
    private String priority;
    private String description;
    private String externalKey;
    private String scheduledTime; // ISO 8601
    private String createdAt; // ISO 8601

    public static TaskDto fromEntity(Task task) {
        return TaskDto.builder()
                .id(task.getId().toString())
                .title(task.getTitle())
                .source(task.getSource().name().toLowerCase())
                .status(mapStatus(task.getStatus()))
                .priority(task.getPriority().name().toLowerCase())
                .description(task.getDescription())
                .externalKey(task.getExternalId())
                .scheduledTime(task.getDueDate() != null ? task.getDueDate().toString() : null)
                .createdAt(task.getCreatedAt().toString())
                .build();
    }

    private static String mapStatus(Task.TaskStatus status) {
        return switch (status) {
            case TODO -> "todo";
            case IN_PROGRESS -> "in_progress";
            case COMPLETED -> "done";
            case BLOCKED -> "blocked";
            case CANCELLED -> "paused";
        };
    }
}

// Made with Bob