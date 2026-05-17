package com.devday.repository;

import com.devday.entity.WorkLog;
import com.devday.entity.WorkLog.WorkLogType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for WorkLog entity
 */
@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {

    /**
     * Find all work logs for a user
     */
    List<WorkLog> findByUserIdOrderByLoggedAtDesc(Long userId);

    /**
     * Find work logs logged today
     */
    @Query("SELECT wl FROM WorkLog wl WHERE wl.user.id = :userId " +
           "AND wl.loggedAt >= :startOfDay " +
           "ORDER BY wl.loggedAt DESC")
    List<WorkLog> findWorkLogsToday(@Param("userId") Long userId, 
                                    @Param("startOfDay") Instant startOfDay);

    /**
     * Find work logs by type
     */
    List<WorkLog> findByUserIdAndLogTypeOrderByLoggedAtDesc(Long userId, WorkLogType logType);

    /**
     * Find work logs by task
     */
    List<WorkLog> findByTaskIdOrderByLoggedAtDesc(Long taskId);

    /**
     * Find work logs in date range
     */
    @Query("SELECT wl FROM WorkLog wl WHERE wl.user.id = :userId " +
           "AND wl.loggedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY wl.loggedAt DESC")
    List<WorkLog> findWorkLogsBetween(@Param("userId") Long userId,
                                      @Param("startDate") Instant startDate,
                                      @Param("endDate") Instant endDate);

    /**
     * Sum duration of work logs today
     */
    @Query("SELECT COALESCE(SUM(wl.durationMinutes), 0) FROM WorkLog wl " +
           "WHERE wl.user.id = :userId AND wl.loggedAt >= :startOfDay")
    long sumDurationToday(@Param("userId") Long userId, 
                         @Param("startOfDay") Instant startOfDay);
}

// Made with Bob