package com.devday.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtTokenProvider
 * Tests JWT token generation, validation, and claim extraction
 */
@DisplayName("JwtTokenProvider Unit Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    
    private static final String TEST_SECRET = "mySecretKeyForTestingPurposesOnlyMustBeLongEnough12345678";
    private static final long TEST_EXPIRATION = 3600000; // 1 hour
    private static final Long TEST_USER_ID = 123L;
    private static final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        
        // Use ReflectionTestUtils to set private fields
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", TEST_EXPIRATION);
    }

    @Test
    @DisplayName("Should generate valid JWT token")
    void generateToken_Success() {
        // Act
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts: header.payload.signature
    }

    @Test
    @DisplayName("Should extract user ID from valid token")
    void getUserIdFromToken_Success() {
        // Arrange
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);

        // Act
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        // Assert
        assertNotNull(userId);
        assertEquals(TEST_USER_ID, userId);
    }

    @Test
    @DisplayName("Should extract email from valid token")
    void getEmailFromToken_Success() {
        // Arrange
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);

        // Act
        String email = jwtTokenProvider.getEmailFromToken(token);

        // Assert
        assertNotNull(email);
        assertEquals(TEST_EMAIL, email);
    }

    @Test
    @DisplayName("Should validate correct token")
    void validateToken_ValidToken_ReturnsTrue() {
        // Arrange
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Should reject invalid token")
    void validateToken_InvalidToken_ReturnsFalse() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject malformed token")
    void validateToken_MalformedToken_ReturnsFalse() {
        // Arrange
        String malformedToken = "not-a-jwt-token";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(malformedToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject empty token")
    void validateToken_EmptyToken_ReturnsFalse() {
        // Arrange
        String emptyToken = "";

        // Act
        boolean isValid = jwtTokenProvider.validateToken(emptyToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject null token")
    void validateToken_NullToken_ReturnsFalse() {
        // Act
        boolean isValid = jwtTokenProvider.validateToken(null);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should reject token signed with different secret")
    void validateToken_DifferentSecret_ReturnsFalse() {
        // Arrange - Generate token with current secret
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);
        
        // Change the secret
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", 
            "differentSecretKeyForTestingPurposesOnlyMustBeLongEnough12345678");

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should handle expired token gracefully")
    void validateToken_ExpiredToken_ReturnsFalse() throws InterruptedException {
        // Arrange - Set very short expiration (1 millisecond)
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 1L);
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);
        
        // Wait for token to expire
        Thread.sleep(10);

        // Act
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Assert
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Should generate different tokens for different users")
    void generateToken_DifferentUsers_GeneratesDifferentTokens() {
        // Arrange
        Long userId1 = 1L;
        Long userId2 = 2L;
        String email1 = "user1@example.com";
        String email2 = "user2@example.com";

        // Act
        String token1 = jwtTokenProvider.generateToken(userId1, email1);
        String token2 = jwtTokenProvider.generateToken(userId2, email2);

        // Assert
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Should generate different tokens for same user at different times")
    void generateToken_SameUserDifferentTimes_GeneratesDifferentTokens() throws InterruptedException {
        // Act
        String token1 = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);
        Thread.sleep(10); // Small delay to ensure different timestamp
        String token2 = jwtTokenProvider.generateToken(TEST_USER_ID, TEST_EMAIL);

        // Assert
        assertNotEquals(token1, token2);
    }

    @Test
    @DisplayName("Should throw exception when extracting user ID from invalid token")
    void getUserIdFromToken_InvalidToken_ThrowsException() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act & Assert
        assertThrows(JwtException.class, () -> {
            jwtTokenProvider.getUserIdFromToken(invalidToken);
        });
    }

    @Test
    @DisplayName("Should throw exception when extracting email from invalid token")
    void getEmailFromToken_InvalidToken_ThrowsException() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act & Assert
        assertThrows(JwtException.class, () -> {
            jwtTokenProvider.getEmailFromToken(invalidToken);
        });
    }

    @Test
    @DisplayName("Should handle special characters in email")
    void generateToken_SpecialCharactersInEmail_Success() {
        // Arrange
        String specialEmail = "test+special@example.co.uk";

        // Act
        String token = jwtTokenProvider.generateToken(TEST_USER_ID, specialEmail);
        String extractedEmail = jwtTokenProvider.getEmailFromToken(token);

        // Assert
        assertNotNull(token);
        assertEquals(specialEmail, extractedEmail);
    }

    @Test
    @DisplayName("Should handle large user ID")
    void generateToken_LargeUserId_Success() {
        // Arrange
        Long largeUserId = Long.MAX_VALUE;

        // Act
        String token = jwtTokenProvider.generateToken(largeUserId, TEST_EMAIL);
        Long extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

        // Assert
        assertNotNull(token);
        assertEquals(largeUserId, extractedUserId);
    }
}

// Made with Bob