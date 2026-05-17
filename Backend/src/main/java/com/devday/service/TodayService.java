package com.devday.service;

import com.devday.dto.*;
import com.devday.entity.FocusSession;
import com.devday.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Today aggregation endpoint
 */
@Service
@RequiredArgsConstructor
public class TodayService {

    private final TaskRepository taskRepository;
    private final FocusSessionRepository focusSessionRepository;
    private final WorkLogRepository workLogRepository;
    private final BlockerRepository blockerRepository;
    private final OpenLoopRepository openLoopRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public TodayDataDto getTodayData(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Instant startOfDay = LocalDate.now()
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();

        // Get all active tasks
        List<TaskDto> tasks = taskRepository.findActiveTasks(userId)
                .stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());

        // Get active focus session
        FocusSessionDto focusSession = focusSessionRepository
                .findByUserIdAndStatus(userId, FocusSession.FocusSessionStatus.ACTIVE)
                .map(FocusSessionDto::fromEntity)
                .orElse(null);

        // Get work logs from today
        List<WorkLogDto> workLogs = workLogRepository.findWorkLogsToday(userId, startOfDay)
                .stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());

        // Get active blockers
        List<BlockerDto> blockers = blockerRepository
                .findByUserIdAndStatusOrderByBlockedAtDesc(userId, 
                    com.devday.entity.Blocker.BlockerStatus.ACTIVE)
                .stream()
                .map(BlockerDto::fromEntity)
                .collect(Collectors.toList());

        // Get open loops
        List<OpenLoopDto> openLoops = openLoopRepository
                .findByUserIdAndStatusOrderByOpenedAtDesc(userId, 
                    com.devday.entity.OpenLoop.OpenLoopStatus.OPEN)
                .stream()
                .map(OpenLoopDto::fromEntity)
                .collect(Collectors.toList());

        return TodayDataDto.builder()
                .date(LocalDate.now().toString())
                .developerName(user.getName())
                .tasks(tasks)
                .focusSession(focusSession)
                .workLogs(workLogs)
                .blockers(blockers)
                .openLoops(openLoops)
                .build();
    }
}

// Made with Bob