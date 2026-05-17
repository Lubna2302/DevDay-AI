package com.devday.service;

import com.devday.dto.BlockerDto;
import com.devday.dto.CreateBlockerRequest;
import com.devday.entity.Blocker;
import com.devday.entity.Task;
import com.devday.entity.User;
import com.devday.repository.BlockerRepository;
import com.devday.repository.TaskRepository;
import com.devday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class BlockerService {

    private final BlockerRepository blockerRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public BlockerDto createBlocker(Long userId, CreateBlockerRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            if (!task.getUser().getId().equals(userId)) {
                throw new RuntimeException("Task does not belong to user");
            }
            task.setStatus(Task.TaskStatus.BLOCKED);
            taskRepository.save(task);
        }

        Blocker blocker = Blocker.builder()
                .user(user)
                .task(task)
                .blockerType(Blocker.BlockerType.OTHER)
                .title("Blocker")
                .description(request.getDescription())
                .status(Blocker.BlockerStatus.ACTIVE)
                .blockedAt(Instant.now())
                .build();

        return BlockerDto.fromEntity(blockerRepository.save(blocker));
    }

    @Transactional
    public BlockerDto resolveBlocker(Long userId, Long blockerId) {
        Blocker blocker = blockerRepository.findById(blockerId)
                .orElseThrow(() -> new RuntimeException("Blocker not found"));

        if (!blocker.getUser().getId().equals(userId)) {
            throw new RuntimeException("Blocker does not belong to user");
        }

        blocker.setStatus(Blocker.BlockerStatus.RESOLVED);
        blocker.setResolvedAt(Instant.now());

        if (blocker.getTask() != null && blocker.getTask().getStatus() == Task.TaskStatus.BLOCKED) {
            Task task = blocker.getTask();
            task.setStatus(Task.TaskStatus.TODO);
            taskRepository.save(task);
        }

        return BlockerDto.fromEntity(blockerRepository.save(blocker));
    }
}
