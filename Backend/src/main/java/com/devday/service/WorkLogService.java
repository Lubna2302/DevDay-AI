package com.devday.service;

import com.devday.dto.CreateWorkLogRequest;
import com.devday.dto.WorkLogDto;
import com.devday.entity.Task;
import com.devday.entity.User;
import com.devday.entity.WorkLog;
import com.devday.repository.TaskRepository;
import com.devday.repository.UserRepository;
import com.devday.repository.WorkLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Work Log operations
 */
@Service
@RequiredArgsConstructor
public class WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public WorkLogDto createWorkLog(Long userId, CreateWorkLogRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            
            // Verify task belongs to user
            if (!task.getUser().getId().equals(userId)) {
                throw new RuntimeException("Task does not belong to user");
            }
        }

        WorkLog.WorkLogType logType;
        try {
            logType = WorkLog.WorkLogType.valueOf(request.getLogType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid log type: " + request.getLogType());
        }

        WorkLog workLog = WorkLog.builder()
                .user(user)
                .task(task)
                .logType(logType)
                .title(request.getTitle())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .loggedAt(Instant.now())
                .build();

        workLog = workLogRepository.save(workLog);

        return WorkLogDto.fromEntity(workLog);
    }

    @Transactional(readOnly = true)
    public List<WorkLogDto> getWorkLogsToday(Long userId) {
        Instant startOfDay = LocalDate.now()
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();

        return workLogRepository.findWorkLogsToday(userId, startOfDay)
                .stream()
                .map(WorkLogDto::fromEntity)
                .collect(Collectors.toList());
    }
}

// Made with Bob