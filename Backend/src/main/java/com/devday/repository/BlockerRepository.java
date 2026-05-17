package com.devday.repository;

import com.devday.entity.Blocker;
import com.devday.entity.Blocker.BlockerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for Blocker entity
 */
@Repository
public interface BlockerRepository extends JpaRepository<Blocker, Long> {

    /**
     * Find all blockers for a user
     */
    List<Blocker> findByUserIdOrderByBlockedAtDesc(Long userId);

    /**
     * Find active blockers for a user
     */
    List<Blocker> findByUserIdAndStatusOrderByBlockedAtDesc(Long userId, BlockerStatus status);

    /**
     * Find blockers by task
     */
    List<Blocker> findByTaskIdOrderByBlockedAtDesc(Long taskId);

    /**
     * Find blockers by focus session
     */
    List<Blocker> findByFocusSessionIdOrderByBlockedAtDesc(Long focusSessionId);

    /**
     * Find blockers created today
     */
    @Query("SELECT b FROM Blocker b WHERE b.user.id = :userId " +
           "AND b.blockedAt >= :startOfDay " +
           "ORDER BY b.blockedAt DESC")
    List<Blocker> findBlockersToday(@Param("userId") Long userId, 
                                    @Param("startOfDay") Instant startOfDay);

    /**
     * Count active blockers
     */
    @Query("SELECT COUNT(b) FROM Blocker b WHERE b.user.id = :userId AND b.status = 'ACTIVE'")
    long countActiveBlockers(@Param("userId") Long userId);
}

// Made with Bob