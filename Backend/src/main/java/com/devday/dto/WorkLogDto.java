package com.devday.dto;

import com.devday.entity.WorkLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WorkLog DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkLogDto {
    private String id;
    private String type;
    private String relatedTaskId;
    private String description;
    private String createdAt; // ISO 8601

    public static WorkLogDto fromEntity(WorkLog workLog) {
        return WorkLogDto.builder()
                .id(workLog.getId().toString())
                .type(mapType(workLog.getLogType()))
                .relatedTaskId(workLog.getTask() != null ? workLog.getTask().getId().toString() : null)
                .description(workLog.getTitle() + (workLog.getDescription() != null ? ": " + workLog.getDescription() : ""))
                .createdAt(workLog.getCreatedAt().toString())
                .build();
    }

    private static String mapType(WorkLog.WorkLogType type) {
        return switch (type) {
            case HELPED_TEAMMATE -> "helped_teammate";
            case DEBUGGING -> "debugging";
            case RESEARCH -> "research";
            case DOCUMENTATION -> "documentation";
            case MEETING -> "meeting";
            case PRODUCTION_SUPPORT -> "production_support";
            case ARCHITECTURE -> "research";
            case OTHER -> "task_update";
        };
    }
}

// Made with Bob