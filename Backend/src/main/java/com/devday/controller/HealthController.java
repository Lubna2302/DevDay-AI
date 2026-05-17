package com.devday.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Provides application health status and database connectivity check
 */
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    /**
     * Health check endpoint
     * Returns application status and database connectivity
     * 
     * @return Health status with database connection info
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test database connection
            try (Connection connection = dataSource.getConnection()) {
                boolean isValid = connection.isValid(2); // 2 second timeout
                
                response.put("status", "UP");
                response.put("database", isValid ? "connected" : "disconnected");
                response.put("timestamp", Instant.now().toString());
                
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("database", "disconnected");
            response.put("error", e.getMessage());
            response.put("timestamp", Instant.now().toString());
            
            return ResponseEntity.status(503).body(response);
        }
    }
}

// Made with Bob
