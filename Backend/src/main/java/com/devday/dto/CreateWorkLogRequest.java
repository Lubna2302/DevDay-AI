package com.devday.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a work log
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkLogRequest {
    
    @NotBlank(message = "Log type is required")
    private String logType; // HELPED_TEAMMATE, DEBUGGING, etc.
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;
    
    private Long taskId; // Optional: related task
}

// Made with Bob