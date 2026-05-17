package com.devday.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * TodayData DTO - Aggregated data for the Today dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodayDataDto {
    private String date; // ISO 8601 date (YYYY-MM-DD)
    private String developerName;
    private List<TaskDto> tasks;
    private FocusSessionDto focusSession;
    private List<WorkLogDto> workLogs;
    private List<BlockerDto> blockers;
    private List<OpenLoopDto> openLoops;
}

// Made with Bob