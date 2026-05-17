package com.devday.config;

import com.devday.entity.Task;
import com.devday.entity.User;
import com.devday.repository.TaskRepository;
import com.devday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        User demo = userRepository.findByEmail("demo@devday.ai").orElseGet(() ->
                userRepository.save(User.builder()
                        .email("demo@devday.ai")
                        .name("Demo Developer")
                        .passwordHash(passwordEncoder.encode("demo123"))
                        .build()));

        if (!taskRepository.findByUserIdOrderByCreatedAtDesc(demo.getId()).isEmpty()) {
            return;
        }

        // Completed tasks
        seedTask(demo, "Fix login timeout", Task.TaskSource.JIRA, Task.TaskPriority.HIGH,
                "AUTH-231", "Investigate token refresh issue causing login timeout.", Task.TaskStatus.COMPLETED);
        seedTask(demo, "Review payment webhook changes", Task.TaskSource.GITHUB, Task.TaskPriority.MEDIUM,
                "PR #82", "Code review for payment webhook retry logic.", Task.TaskStatus.COMPLETED);
        seedTask(demo, "Team sync", Task.TaskSource.TEAMS, Task.TaskPriority.LOW,
                null, "Daily standup and blockers discussion.", Task.TaskStatus.COMPLETED);
        
        // Pending tasks
        seedTask(demo, "Investigate payment webhook retry", Task.TaskSource.JIRA, Task.TaskPriority.MEDIUM,
                "PAY-442", "Check retry behavior for failed payment webhooks.", Task.TaskStatus.TODO);
        seedTask(demo, "Auth middleware cleanup", Task.TaskSource.GITHUB, Task.TaskPriority.LOW,
                "PR #91", "Review refactoring of authentication middleware.", Task.TaskStatus.TODO);
        seedTask(demo, "Sprint planning", Task.TaskSource.CALENDAR, Task.TaskPriority.MEDIUM,
                null, "Weekly sprint planning meeting.", Task.TaskStatus.TODO);
        seedTask(demo, "Update API documentation", Task.TaskSource.MANUAL, Task.TaskPriority.MEDIUM,
                null, "Document new authentication endpoints.", Task.TaskStatus.TODO);

        log.info("Demo user seeded: demo@devday.ai / demo123");
    }

    private void seedTask(User user, String title, Task.TaskSource source, Task.TaskPriority priority,
                          String externalId, String description, Task.TaskStatus status) {
        taskRepository.save(Task.builder()
                .user(user)
                .title(title)
                .description(description)
                .source(source)
                .priority(priority)
                .status(status)
                .externalId(externalId)
                .build());
    }
}
