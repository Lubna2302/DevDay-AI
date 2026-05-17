package com.devday.service;

import com.devday.dto.*;
import com.devday.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for generating AI-powered daily and weekly summaries
 */
@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TaskRepository taskRepository;
    private final WorkLogRepository workLogRepository;
    private final BlockerRepository blockerRepository;
    private final OpenLoopRepository openLoopRepository;

    @Transactional(readOnly = true)
    public DailySummaryDto generateDailySummary(Long userId) {
        LocalDate today = LocalDate.now();
        Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Fetch today's data
        List<TaskDto> tasks = taskRepository.findActiveTasks(userId)
                .stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());

        List<WorkLogDto> workLogs = workLogRepository.findWorkLogsToday(userId, startOfDay)
                .stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());

        List<BlockerDto> blockers = blockerRepository
                .findByUserIdAndStatusOrderByBlockedAtDesc(userId, 
                    com.devday.entity.Blocker.BlockerStatus.ACTIVE)
                .stream()
                .map(BlockerDto::fromEntity)
                .collect(Collectors.toList());

        List<OpenLoopDto> openLoops = openLoopRepository
                .findByUserIdAndStatusOrderByOpenedAtDesc(userId, 
                    com.devday.entity.OpenLoop.OpenLoopStatus.OPEN)
                .stream()
                .map(OpenLoopDto::fromEntity)
                .collect(Collectors.toList());

        // Generate AI summary (mock implementation - replace with actual AI service)
        return generateAIDailySummary(tasks, workLogs, blockers, openLoops, today);
    }

    @Transactional(readOnly = true)
    public WeeklySummaryDto generateWeeklySummary(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        Instant startOfWeek = weekStart.atStartOfDay(ZoneId.systemDefault()).toInstant();

        // Fetch week's data
        List<TaskDto> tasks = taskRepository.findActiveTasks(userId)
                .stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());

        List<WorkLogDto> workLogs = workLogRepository.findWorkLogsToday(userId, startOfWeek)
                .stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());

        // Generate AI summary (mock implementation - replace with actual AI service)
        return generateAIWeeklySummary(tasks, workLogs, weekStart, weekEnd);
    }

    /**
     * Mock AI summary generation for daily work
     * TODO: Replace with actual AI service (OpenAI, Claude, etc.)
     */
    private DailySummaryDto generateAIDailySummary(
            List<TaskDto> tasks,
            List<WorkLogDto> workLogs,
            List<BlockerDto> blockers,
            List<OpenLoopDto> openLoops,
            LocalDate date) {

        // Count completed and in-progress tasks
        long completedCount = tasks.stream().filter(t -> "done".equals(t.getStatus())).count();
        long inProgressCount = tasks.stream().filter(t -> "in_progress".equals(t.getStatus())).count();

        // Build summary sections
        StringBuilder whatIWorkedOn = new StringBuilder();
        tasks.stream()
                .filter(t -> !"todo".equals(t.getStatus()))
                .forEach(t -> whatIWorkedOn.append("• ").append(t.getTitle()).append("\n"));

        StringBuilder completedWork = new StringBuilder();
        tasks.stream()
                .filter(t -> "done".equals(t.getStatus()))
                .forEach(t -> completedWork.append("• ").append(t.getTitle()).append("\n"));

        StringBuilder inProgressWork = new StringBuilder();
        tasks.stream()
                .filter(t -> "in_progress".equals(t.getStatus()))
                .forEach(t -> inProgressWork.append("• ").append(t.getTitle()).append("\n"));

        StringBuilder blockersText = new StringBuilder();
        blockers.forEach(b -> blockersText.append("• ").append(b.getDescription()).append("\n"));

        StringBuilder collaboration = new StringBuilder();
        workLogs.stream()
                .filter(w -> "helped_teammate".equals(w.getType()) || "meeting".equals(w.getType()))
                .forEach(w -> collaboration.append("• ").append(w.getDescription()).append("\n"));

        String leadSummary = String.format(
                "Completed %d tasks, %d in progress. %s",
                completedCount,
                inProgressCount,
                blockers.isEmpty() ? "No blockers." : blockers.size() + " active blockers need attention."
        );

        return DailySummaryDto.builder()
                .id(System.currentTimeMillis()) // Mock ID
                .date(date)
                .whatIWorkedOn(whatIWorkedOn.toString().trim())
                .completedWork(completedWork.toString().trim())
                .inProgressWork(inProgressWork.toString().trim())
                .blockers(blockersText.toString().trim())
                .collaboration(collaboration.toString().trim())
                .tomorrowPlan("Continue with in-progress tasks and address any blockers.")
                .leadFriendlySummary(leadSummary)
                .status("draft")
                .build();
    }

    /**
     * Mock AI summary generation for weekly work
     * TODO: Replace with actual AI service (OpenAI, Claude, etc.)
     */
    private WeeklySummaryDto generateAIWeeklySummary(
            List<TaskDto> tasks,
            List<WorkLogDto> workLogs,
            LocalDate weekStart,
            LocalDate weekEnd) {

        long completedCount = tasks.stream().filter(t -> "done".equals(t.getStatus())).count();

        StringBuilder mainOutcomes = new StringBuilder();
        tasks.stream()
                .filter(t -> "done".equals(t.getStatus()))
                .limit(5)
                .forEach(t -> mainOutcomes.append("• ").append(t.getTitle()).append("\n"));

        StringBuilder progressMade = new StringBuilder();
        progressMade.append(String.format("Completed %d tasks this week.\n", completedCount));
        tasks.stream()
                .filter(t -> "in_progress".equals(t.getStatus()))
                .limit(3)
                .forEach(t -> progressMade.append("• Working on: ").append(t.getTitle()).append("\n"));

        StringBuilder collaboration = new StringBuilder();
        long collaborationCount = workLogs.stream()
                .filter(w -> "helped_teammate".equals(w.getType()) || "meeting".equals(w.getType()))
                .count();
        collaboration.append(String.format("Participated in %d collaborative activities.\n", collaborationCount));

        return WeeklySummaryDto.builder()
                .id(System.currentTimeMillis()) // Mock ID
                .weekStartDate(weekStart)
                .weekEndDate(weekEnd)
                .mainOutcomes(mainOutcomes.toString().trim())
                .progressMade(progressMade.toString().trim())
                .collaboration(collaboration.toString().trim())
                .blockersAndRisks("No major blockers this week.")
                .nextWeekFocus("Continue current initiatives and address any emerging priorities.")
                .status("draft")
                .build();
    }
}

// Made with Bob