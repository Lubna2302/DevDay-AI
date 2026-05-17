package com.devday.service;

import com.devday.dto.FocusSessionDto;
import com.devday.dto.PauseFocusSessionRequest;
import com.devday.dto.StartFocusSessionRequest;
import com.devday.entity.FocusSession;
import com.devday.entity.OpenLoop;
import com.devday.entity.Task;
import com.devday.entity.User;
import com.devday.repository.FocusSessionRepository;
import com.devday.repository.OpenLoopRepository;
import com.devday.repository.TaskRepository;
import com.devday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Service for Focus Session operations
 */
@Service
@RequiredArgsConstructor
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final OpenLoopRepository openLoopRepository;

    @Transactional
    public FocusSessionDto startFocusSession(Long userId, StartFocusSessionRequest request) {
        // Check if user already has an active session
        if (focusSessionRepository.hasActiveSession(userId)) {
            throw new RuntimeException("User already has an active focus session");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to user
        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task does not belong to user");
        }

        FocusSession session = FocusSession.builder()
                .user(user)
                .task(task)
                .goal(request.getGoal())
                .plannedDurationMinutes(request.getPlannedDurationMinutes())
                .status(FocusSession.FocusSessionStatus.ACTIVE)
                .startedAt(Instant.now())
                .build();

        session = focusSessionRepository.save(session);

        // Update task status to IN_PROGRESS
        task.setStatus(Task.TaskStatus.IN_PROGRESS);
        taskRepository.save(task);

        return FocusSessionDto.fromEntity(session);
    }

    @Transactional(readOnly = true)
    public FocusSessionDto getActiveSession(Long userId) {
        return focusSessionRepository
                .findByUserIdAndStatus(userId, FocusSession.FocusSessionStatus.ACTIVE)
                .map(FocusSessionDto::fromEntity)
                .orElse(null);
    }

    @Transactional
    public FocusSessionDto completeFocusSession(Long userId, Long sessionId) {
        FocusSession session = focusSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Focus session not found"));

        // Verify session belongs to user
        if (!session.getUser().getId().equals(userId)) {
            throw new RuntimeException("Focus session does not belong to user");
        }

        if (session.getStatus() != FocusSession.FocusSessionStatus.ACTIVE) {
            throw new RuntimeException("Focus session is not active");
        }

        // Calculate actual duration
        long minutes = Duration.between(session.getStartedAt(), Instant.now()).toMinutes();
        session.setActualDurationMinutes((int) minutes);
        session.setStatus(FocusSession.FocusSessionStatus.COMPLETED);
        session.setCompletedAt(Instant.now());

        session = focusSessionRepository.save(session);

        return FocusSessionDto.fromEntity(session);
    }

    @Transactional
    public FocusSessionDto pauseFocusSession(Long userId, Long sessionId, PauseFocusSessionRequest request) {
        FocusSession session = focusSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Focus session not found"));

        // Verify session belongs to user
        if (!session.getUser().getId().equals(userId)) {
            throw new RuntimeException("Focus session does not belong to user");
        }

        if (session.getStatus() != FocusSession.FocusSessionStatus.ACTIVE) {
            throw new RuntimeException("Focus session is not active");
        }

        // Update session status
        session.setStatus(FocusSession.FocusSessionStatus.PAUSED);
        session.setPausedAt(Instant.now());
        session.setPauseNote(request.getReason());
        session = focusSessionRepository.save(session);

        // Create open loop
        Task toTask = null;
        if (request.getToTaskId() != null) {
            toTask = taskRepository.findById(request.getToTaskId()).orElse(null);
        }

        OpenLoop openLoop = OpenLoop.builder()
                .user(session.getUser())
                .focusSession(session)
                .fromTask(session.getTask())
                .toTask(toTask)
                .context(request.getContext())
                .reason(request.getReason())
                .status(OpenLoop.OpenLoopStatus.OPEN)
                .openedAt(Instant.now())
                .build();

        openLoopRepository.save(openLoop);

        return FocusSessionDto.fromEntity(session);
    }
}

// Made with Bob