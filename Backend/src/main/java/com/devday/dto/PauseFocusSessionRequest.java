package com.devday.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for pausing a focus session (creates an open loop)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PauseFocusSessionRequest {
    
    @NotBlank(message = "Context is required")
    private String context; // Current state to resume later
    
    @NotBlank(message = "Reason is required")
    private String reason; // Why the switch happened
    
    private Long toTaskId; // Optional: task being switched to
}

// Made with Bob