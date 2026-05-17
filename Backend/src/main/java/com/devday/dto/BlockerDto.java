package com.devday.dto;

import com.devday.entity.Blocker;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Blocker DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockerDto {
    private String id;
    private String relatedTaskId;
    private String description;
    private String status;
    private String createdAt; // ISO 8601
    private String resolvedAt; // ISO 8601

    public static BlockerDto fromEntity(Blocker blocker) {
        return BlockerDto.builder()
                .id(blocker.getId().toString())
                .relatedTaskId(blocker.getTask() != null ? blocker.getTask().getId().toString() : null)
                .description(blocker.getTitle() + ": " + blocker.getDescription())
                .status(blocker.getStatus() == Blocker.BlockerStatus.ACTIVE ? "active" : "resolved")
                .createdAt(blocker.getCreatedAt().toString())
                .resolvedAt(blocker.getResolvedAt() != null ? blocker.getResolvedAt().toString() : null)
                .build();
    }
}

// Made with Bob