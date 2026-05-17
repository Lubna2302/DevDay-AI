package com.devday.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Blocker Entity
 * Represents impediments that block progress on tasks
 */
@Entity
@Table(name = "blockers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Blocker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "focus_session_id")
    private FocusSession focusSession;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "blocker_type", nullable = false, columnDefinition = "blocker_type")
    private BlockerType blockerType;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "blocker_status")
    @Builder.Default
    private BlockerStatus status = BlockerStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "blocked_at", nullable = false)
    @Builder.Default
    private Instant blockedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (blockedAt == null) {
            blockedAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum BlockerStatus {
        ACTIVE, RESOLVED, ESCALATED
    }

    public enum BlockerType {
        TECHNICAL, DEPENDENCY, RESOURCE, CLARIFICATION, ENVIRONMENT, OTHER
    }
}

// Made with Bob