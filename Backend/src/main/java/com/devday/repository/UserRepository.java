package com.devday.repository;

import com.devday.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User Repository
 * Data access layer for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by BOB user ID (for IBM BOB integration)
     */
    Optional<User> findByBobUserId(String bobUserId);

    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);
}

// Made with Bob
