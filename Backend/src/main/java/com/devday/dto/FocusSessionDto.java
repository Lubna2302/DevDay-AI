package com.devday.dto;

import com.devday.entity.FocusSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FocusSession DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FocusSessionDto {
    private String id;
    private String taskId;
    private Integer durationMinutes;
    private String goal;
    private String status;
    private String startedAt; // ISO 8601
    private String completedAt; // ISO 8601

    public static FocusSessionDto fromEntity(FocusSession session) {
        return FocusSessionDto.builder()
                .id(session.getId().toString())
                .taskId(session.getTask().getId().toString())
                .durationMinutes(session.getActualDurationMinutes() != null 
                    ? session.getActualDurationMinutes() 
                    : session.getPlannedDurationMinutes())
                .goal(session.getGoal())
                .status(mapStatus(session.getStatus()))
                .startedAt(session.getStartedAt() != null ? session.getStartedAt().toString() : null)
                .completedAt(session.getCompletedAt() != null ? session.getCompletedAt().toString() : null)
                .build();
    }

    private static String mapStatus(FocusSession.FocusSessionStatus status) {
        return switch (status) {
            case ACTIVE -> "active";
            case COMPLETED -> "completed";
            case PAUSED -> "paused";
            case ABANDONED -> "cancelled";
        };
    }
}

// Made with Bob