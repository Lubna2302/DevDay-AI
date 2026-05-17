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
 * OpenLoop Entity
 * Represents context switches when pausing focus sessions
 */
@Entity
@Table(name = "open_loops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpenLoop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "focus_session_id", nullable = false)
    private FocusSession focusSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_task_id", nullable = false)
    private Task fromTask;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_task_id")
    private Task toTask;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String context;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "open_loop_status")
    @Builder.Default
    private OpenLoopStatus status = OpenLoopStatus.OPEN;

    @Column(name = "opened_at", nullable = false)
    @Builder.Default
    private Instant openedAt = Instant.now();

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (openedAt == null) {
            openedAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum OpenLoopStatus {
        OPEN, CLOSED, ABANDONED
    }
}

// Made with Bob