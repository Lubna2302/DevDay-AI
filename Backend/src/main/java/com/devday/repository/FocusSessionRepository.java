package com.devday.repository;

import com.devday.entity.FocusSession;
import com.devday.entity.FocusSession.FocusSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for FocusSession entity
 */
@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

    /**
     * Find active focus session for a user
     */
    Optional<FocusSession> findByUserIdAndStatus(Long userId, FocusSessionStatus status);

    /**
     * Find all focus sessions for a user
     */
    List<FocusSession> findByUserIdOrderByStartedAtDesc(Long userId);

    /**
     * Find focus sessions started today
     */
    @Query("SELECT fs FROM FocusSession fs WHERE fs.user.id = :userId " +
           "AND fs.startedAt >= :startOfDay " +
           "ORDER BY fs.startedAt DESC")
    List<FocusSession> findSessionsStartedToday(@Param("userId") Long userId, 
                                                 @Param("startOfDay") Instant startOfDay);

    /**
     * Find completed focus sessions for a user
     */
    List<FocusSession> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, FocusSessionStatus status);

    /**
     * Find focus sessions by task
     */
    List<FocusSession> findByTaskIdOrderByStartedAtDesc(Long taskId);

    /**
     * Check if user has an active session
     */
    @Query("SELECT CASE WHEN COUNT(fs) > 0 THEN true ELSE false END " +
           "FROM FocusSession fs WHERE fs.user.id = :userId AND fs.status = 'ACTIVE'")
    boolean hasActiveSession(@Param("userId") Long userId);

    /**
     * Count completed sessions today
     */
    @Query("SELECT COUNT(fs) FROM FocusSession fs WHERE fs.user.id = :userId " +
           "AND fs.status = 'COMPLETED' AND fs.completedAt >= :startOfDay")
    long countCompletedSessionsToday(@Param("userId") Long userId, 
                                     @Param("startOfDay") Instant startOfDay);
}

// Made with Bob