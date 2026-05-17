package com.devday.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        List<String> details = new ArrayList<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> details.add(error.getDefaultMessage()));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(
                "VALIDATION_ERROR", "Invalid input data", details));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(
                "INVALID_REQUEST", ex.getMessage(), List.of()));
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            org.springframework.security.core.AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody(
                "UNAUTHORIZED", "Authentication failed", List.of(ex.getMessage())));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Request failed";
        HttpStatus status = HttpStatus.CONFLICT;
        String code = "CONFLICT";

        if (message.contains("Invalid email or password") || message.contains("not found")) {
            status = message.contains("password") ? HttpStatus.UNAUTHORIZED : HttpStatus.NOT_FOUND;
            code = status == HttpStatus.UNAUTHORIZED ? "UNAUTHORIZED" : "NOT_FOUND";
        } else if (message.contains("already registered") || message.contains("already has an active")) {
            status = HttpStatus.CONFLICT;
            code = "CONFLICT";
        }

        return ResponseEntity.status(status).body(errorBody(code, message, List.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody(
                "INTERNAL_ERROR", ex.getMessage(), List.of()));
    }

    private Map<String, Object> errorBody(String code, String message, List<String> details) {
        Map<String, Object> errorObj = new HashMap<>();
        errorObj.put("code", code);
        errorObj.put("message", message);
        errorObj.put("details", details);

        Map<String, Object> body = new HashMap<>();
        body.put("error", errorObj);
        body.put("timestamp", Instant.now().toString());
        return body;
    }
}
