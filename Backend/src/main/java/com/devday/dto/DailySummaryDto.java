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
public class DailySummaryDto {
    private Long id;
    private LocalDate date;
    private String whatIWorkedOn;
    private String completedWork;
    private String inProgressWork;
    private String blockers;
    private String collaboration;
    private String tomorrowPlan;
    private String leadFriendlySummary;
    private String status; // draft, saved, submitted
}

// Made with Bob