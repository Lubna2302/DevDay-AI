package com.devday.service;

import com.devday.dto.CreateTaskRequest;
import com.devday.dto.TaskDto;
import com.devday.dto.UpdateTaskStatusRequest;
import com.devday.entity.Task;
import com.devday.entity.User;
import com.devday.repository.TaskRepository;
import com.devday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskDto createTask(Long userId, CreateTaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task.TaskSource source = parseSource(request.getSource());
        Task.TaskPriority priority = parsePriority(request.getPriority());

        Task task = Task.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .source(source)
                .priority(priority)
                .status(Task.TaskStatus.TODO)
                .build();

        return TaskDto.fromEntity(taskRepository.save(task));
    }

    @Transactional
    public TaskDto updateTaskStatus(Long userId, Long taskId, UpdateTaskStatusRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task does not belong to user");
        }

        task.setStatus(parseStatus(request.getStatus()));
        if (task.getStatus() == Task.TaskStatus.COMPLETED) {
            task.setCompletedAt(Instant.now());
        }
        return TaskDto.fromEntity(taskRepository.save(task));
    }

    private Task.TaskSource parseSource(String source) {
        if (source == null || source.isBlank()) {
            return Task.TaskSource.MANUAL;
        }
        return switch (source.toLowerCase()) {
            case "jira" -> Task.TaskSource.JIRA;
            case "github", "bitbucket" -> Task.TaskSource.GITHUB;
            case "calendar" -> Task.TaskSource.CALENDAR;
            case "teams" -> Task.TaskSource.TEAMS;
            default -> Task.TaskSource.MANUAL;
        };
    }

    private Task.TaskPriority parsePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return Task.TaskPriority.MEDIUM;
        }
        return switch (priority.toLowerCase()) {
            case "low" -> Task.TaskPriority.LOW;
            case "high" -> Task.TaskPriority.HIGH;
            case "urgent" -> Task.TaskPriority.URGENT;
            default -> Task.TaskPriority.MEDIUM;
        };
    }

    private Task.TaskStatus parseStatus(String status) {
        return switch (status.toLowerCase()) {
            case "in_progress" -> Task.TaskStatus.IN_PROGRESS;
            case "done", "completed" -> Task.TaskStatus.COMPLETED;
            case "blocked" -> Task.TaskStatus.BLOCKED;
            case "paused", "cancelled" -> Task.TaskStatus.CANCELLED;
            default -> Task.TaskStatus.TODO;
        };
    }
}
