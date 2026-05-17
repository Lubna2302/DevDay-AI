package com.devday.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklySummaryDto {
    private Long id;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private String mainOutcomes;
    private String progressMade;
    private String collaboration;
    private String blockersAndRisks;
    private String nextWeekFocus;
    private String status; // draft, saved, submitted
}

// Made with Bob