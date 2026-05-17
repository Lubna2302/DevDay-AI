package com.devday.repository;

import com.devday.entity.OpenLoop;
import com.devday.entity.OpenLoop.OpenLoopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for OpenLoop entity
 */
@Repository
public interface OpenLoopRepository extends JpaRepository<OpenLoop, Long> {

    /**
     * Find all open loops for a user
     */
    List<OpenLoop> findByUserIdOrderByOpenedAtDesc(Long userId);

    /**
     * Find open loops by status
     */
    List<OpenLoop> findByUserIdAndStatusOrderByOpenedAtDesc(Long userId, OpenLoopStatus status);

    /**
     * Find open loops by focus session
     */
    List<OpenLoop> findByFocusSessionIdOrderByOpenedAtDesc(Long focusSessionId);

    /**
     * Find open loops opened today
     */
    @Query("SELECT ol FROM OpenLoop ol WHERE ol.user.id = :userId " +
           "AND ol.openedAt >= :startOfDay " +
           "ORDER BY ol.openedAt DESC")
    List<OpenLoop> findOpenLoopsToday(@Param("userId") Long userId, 
                                      @Param("startOfDay") Instant startOfDay);

    /**
     * Count open loops by status
     */
    @Query("SELECT COUNT(ol) FROM OpenLoop ol WHERE ol.user.id = :userId AND ol.status = 'OPEN'")
    long countOpenLoops(@Param("userId") Long userId);
}

// Made with Bob