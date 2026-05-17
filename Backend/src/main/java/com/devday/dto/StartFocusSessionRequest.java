package com.devday.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for starting a focus session
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartFocusSessionRequest {
    
    @NotNull(message = "Task ID is required")
    private Long taskId;
    
    @NotBlank(message = "Goal is required")
    private String goal;
    
    @NotNull(message = "Planned duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer plannedDurationMinutes;
}

// Made with Bob