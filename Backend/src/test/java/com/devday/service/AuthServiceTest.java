package com.devday.service;

import com.devday.dto.AuthRequest;
import com.devday.dto.AuthResponse;
import com.devday.dto.RegisterRequest;
import com.devday.dto.UserDto;
import com.devday.entity.User;
import com.devday.repository.UserRepository;
import com.devday.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 * Tests authentication, registration, and user retrieval logic
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .passwordHash("hashedPassword123")
                .build();

        // Setup register request
        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .name("Test User")
                .password("password123")
                .build();

        // Setup auth request
        authRequest = AuthRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void register_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(anyLong(), anyString())).thenReturn("jwt-token-123");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token-123", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals("Test User", response.getUser().getName());

        // Verify interactions
        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(jwtTokenProvider).generateToken(1L, "test@example.com");
    }

    @Test
    @DisplayName("Should throw exception when email already exists during registration")
    void register_EmailAlreadyExists_ThrowsException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> authService.register(registerRequest)
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
        verify(jwtTokenProvider, never()).generateToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void login_Success() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtTokenProvider.generateToken(anyLong(), anyString())).thenReturn("jwt-token-123");

        // Act
        AuthResponse response = authService.login(authRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token-123", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());
        assertEquals("Test User", response.getUser().getName());

        // Verify interactions
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "hashedPassword123");
        verify(jwtTokenProvider).generateToken(1L, "test@example.com");
    }

    @Test
    @DisplayName("Should throw exception when user not found during login")
    void login_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> authService.login(authRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtTokenProvider, never()).generateToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect during login")
    void login_InvalidPassword_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> authService.login(authRequest)
        );

        assertEquals("Invalid email or password", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "hashedPassword123");
        verify(jwtTokenProvider, never()).generateToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should successfully get user by ID")
    void getUserById_Success() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

        // Act
        UserDto userDto = authService.getUserById(1L);

        // Assert
        assertNotNull(userDto);
        assertEquals(1L, userDto.getId());
        assertEquals("test@example.com", userDto.getEmail());
        assertEquals("Test User", userDto.getName());

        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when user not found by ID")
    void getUserById_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> authService.getUserById(1L)
        );

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Should handle null email in register request")
    void register_NullEmail_HandledByValidation() {
        // This test verifies that the service layer receives validated data
        // Actual validation happens at controller level with @Valid annotation
        registerRequest.setEmail(null);
        when(userRepository.existsByEmail(null)).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword123");
        
        User userWithNullEmail = User.builder()
                .id(1L)
                .email(null)
                .name("Test User")
                .passwordHash("hashedPassword123")
                .build();
        
        when(userRepository.save(any(User.class))).thenReturn(userWithNullEmail);
        when(jwtTokenProvider.generateToken(anyLong(), any())).thenReturn("jwt-token-123");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert - service processes what it receives
        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }
}

// Made with Bob