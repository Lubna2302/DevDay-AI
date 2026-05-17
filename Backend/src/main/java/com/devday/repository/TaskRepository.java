package com.devday.repository;

import com.devday.entity.Task;
import com.devday.entity.Task.TaskSource;
import com.devday.entity.Task.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Task entity
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks for a user
     */
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find tasks by user and status
     */
    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, TaskStatus status);

    /**
     * Find tasks by user and source
     */
    List<Task> findByUserIdAndSourceOrderByCreatedAtDesc(Long userId, TaskSource source);

    /**
     * Find tasks by user, grouped by source (for today view)
     */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND t.status IN ('TODO', 'IN_PROGRESS', 'BLOCKED') " +
           "ORDER BY t.priority DESC, t.createdAt DESC")
    List<Task> findActiveTasks(@Param("userId") Long userId);

    /**
     * Find tasks created today
     */
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND t.createdAt >= :startOfDay " +
           "ORDER BY t.createdAt DESC")
    List<Task> findTasksCreatedToday(@Param("userId") Long userId, 
                                     @Param("startOfDay") Instant startOfDay);

    /**
     * Find task by external ID and source
     */
    Optional<Task> findByUserIdAndSourceAndExternalId(Long userId, TaskSource source, String externalId);

    /**
     * Count active tasks by user
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId " +
           "AND t.status IN ('TODO', 'IN_PROGRESS', 'BLOCKED')")
    long countActiveTasks(@Param("userId") Long userId);
}

// Made with Bob