# DevDay AI Backend - Chat Session Guide
## DELIVERABLE G: One-Chat-Per-API Implementation Prompts

> **CRITICAL**: Start a NEW CHAT for each API. Do NOT continue from previous chats.  
> **Each prompt is self-contained** with all context needed for that specific API.

---

## 📋 How to Use This Guide

### Workflow
1. **Open new chat** for each API (API 1, API 2, etc.)
2. **Copy-paste the entire prompt** for that API
3. **Implement and test** until success criteria met
4. **Copy handoff block** to PROGRESS.md
5. **Commit changes** to git
6. **Close chat** and open new one for next API

### Rules
- ✅ ONE chat per API (no exceptions)
- ✅ Copy entire prompt (don't summarize)
- ✅ Test before moving to next API
- ✅ Update PROGRESS.md after each API
- ❌ Do NOT reference "previous chat"
- ❌ Do NOT assume context from earlier APIs

---

## 🎯 API Implementation Order

| API | Title | Prerequisites | Estimated Hours |
|-----|-------|---------------|-----------------|
| 1 | Project Setup | None | 1.5 |
| 2 | User Auth | API 1 | 2.0 |
| 3 | Task CRUD | API 2 | 2.0 |
| 3B | Blocker/OpenLoop Entities | API 3 | 1.0 |
| 4 | Jira Mock | API 3B | 1.5 |
| 5 | GitHub Mock | API 4 | 1.0 |
| 6 | Calendar/Teams Mock | API 5 | 1.5 |
| 7 | Today Aggregation | API 6 | 2.0 |
| 8 | Task Status | API 7 | 1.5 |
| 9 | Task Search (OPTIONAL) | API 8 | 1.5 |
| 10 | Focus Start | API 8 | 2.0 |
| 11 | Focus Pause | API 10 | 1.5 |
| 12 | Focus Complete | API 11 | 1.5 |
| 13 | Work Logs | API 12 | 1.5 |
| 14 | Blocker Mgmt | API 13 | 1.0 |
| 15 | OpenLoop Mgmt | API 14 | 1.0 |
| 16 | LLM Service | API 15 | 2.0 |
| 17 | Daily Summary | API 16 | 2.0 |
| 18 | Weekly Summary (OPTIONAL) | API 17 | 1.5 |
| 19 | IBM BOB | API 17 | 2.5 |

---

# API 1: Project Setup & Health Check

## START NEW CHAT — Do not continue from previous API chats

### Context
You are implementing **API 1** of the DevDay AI backend for the IBM BOB hackathon. This is the **bootstrap API** that sets up the Spring Boot project, PostgreSQL connection, and health endpoint.

### Prerequisites
- None (this is the first API)

### Project Details
- **Name**: DevDay AI Backend
- **Stack**: Spring Boot 3.2.x, Java 17, PostgreSQL 15, Maven
- **Base Package**: `com.devday`
- **Context Path**: `/api` (all endpoints prefixed with `/api`)
- **Database**: PostgreSQL via Docker
- **Port**: 8080

### Goal
Create a working Spring Boot application that:
1. Connects to PostgreSQL via Docker
2. Has Flyway migrations configured
3. Exposes a health check endpoint
4. Has proper CORS configuration
5. Has exception handling framework

### Implement in This Chat Only

#### 1. Maven Project Structure
Create `pom.xml` with dependencies:
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- postgresql driver
- flyway-core
- lombok
- spring-boot-starter-validation
- spring-boot-starter-actuator

#### 2. Application Configuration
Create `src/main/resources/application.yml`:
```yaml
spring:
  application:
    name: devday-ai-backend
  datasource:
    url: jdbc:postgresql://localhost:5432/devday_ai
    username: ${DB_USERNAME:devday}
    password: ${DB_PASSWORD:devday123}
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  port: 8080
  servlet:
    context-path: /api
```

#### 3. Docker Compose
Create `docker-compose.yml` for PostgreSQL:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: devday_ai
      POSTGRES_USER: devday
      POSTGRES_PASSWORD: devday123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

#### 4. Main Application Class
Create `src/main/java/com/devday/DevDayApplication.java`:
```java
@SpringBootApplication
public class DevDayApplication {
    public static void main(String[] args) {
        SpringApplication.run(DevDayApplication.class, args);
    }
}
```

#### 5. Health Check Controller
Create `src/main/java/com/devday/controller/HealthController.java`:
```java
@RestController
@RequestMapping("/health")
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("database", checkDatabase());
        response.put("timestamp", Instant.now());
        return ResponseEntity.ok(response);
    }
    
    private String checkDatabase() {
        try (Connection conn = dataSource.getConnection()) {
            return conn.isValid(1) ? "connected" : "disconnected";
        } catch (Exception e) {
            return "error";
        }
    }
}
```

#### 6. CORS Configuration
Create `src/main/java/com/devday/config/CorsConfig.java`:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

#### 7. Global Exception Handler
Create `src/main/java/com/devday/exception/GlobalExceptionHandler.java`:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", Map.of(
            "code", "INTERNAL_ERROR",
            "message", e.getMessage()
        ));
        error.put("timestamp", Instant.now());
        return ResponseEntity.status(500).body(error);
    }
}
```

#### 8. Flyway Migration (Empty for Now)
Create `src/main/resources/db/migration/V1__init_schema.sql`:
```sql
-- Initial schema setup
-- Tables will be added in subsequent APIs
```

### Do NOT Implement in This Chat
- User authentication (API 2)
- Task entities (API 3)
- Any business logic

### Endpoints to Implement
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check with DB status |

### Success Criteria
1. ✅ Application starts on port 8080
2. ✅ PostgreSQL connects successfully
3. ✅ `GET /api/health` returns 200 with `{"status":"UP","database":"connected"}`
4. ✅ Flyway migrations run without errors
5. ✅ No compilation errors

### Test Commands
```bash
# Start PostgreSQL
docker-compose up -d

# Run application
./mvnw spring-boot:run

# Test health endpoint
curl http://localhost:8080/api/health

# Expected response:
# {"status":"UP","database":"connected","timestamp":"2024-01-15T10:00:00Z"}
```

### Files to Create
- `pom.xml`
- `src/main/java/com/devday/DevDayApplication.java`
- `src/main/java/com/devday/controller/HealthController.java`
- `src/main/java/com/devday/config/CorsConfig.java`
- `src/main/java/com/devday/exception/GlobalExceptionHandler.java`
- `src/main/resources/application.yml`
- `src/main/resources/db/migration/V1__init_schema.sql`
- `docker-compose.yml`
- `.gitignore`

### Handoff Block (Copy to PROGRESS.md After Completion)
```markdown
## API 1: Project Setup & Health Check — COMPLETE ✅
**Completed**: [DATE]
**Files Created**:
- pom.xml
- DevDayApplication.java
- HealthController.java
- CorsConfig.java
- GlobalExceptionHandler.java
- application.yml
- docker-compose.yml
- V1__init_schema.sql

**Endpoints Live**:
- GET /api/health

**DB Migrations**:
- V1__init_schema.sql (empty, ready for tables)

**Environment Variables Required**:
- DB_USERNAME (default: devday)
- DB_PASSWORD (default: devday123)

**Known Limitations**:
- No authentication yet
- No business logic yet
- Health check is basic (no detailed metrics)

**Next Chat**: Start NEW chat with prompt "API 2: User Management & JWT Authentication"
```

---

# API 2: User Management & JWT Authentication

## START NEW CHAT — Do not continue from previous API chats

### Context
You are implementing **API 2** of the DevDay AI backend. This API adds user management and JWT authentication to the existing Spring Boot project.

### Prerequisites (Must Be Complete)
- **API 1**: Project setup, health endpoint, PostgreSQL connection working

### Project State
- Spring Boot 3.2.x app running on port 8080
- PostgreSQL connected via Docker
- Base package: `com.devday`
- Context path: `/api`
- Flyway configured

### Goal
Implement user registration, login, and JWT-based authentication so that:
1. Users can register with email/password
2. Users can login and receive JWT token
3. Protected endpoints require valid JWT
4. Passwords are BCrypt hashed

### Implement in This Chat Only

#### 1. User Entity & Repository
Create `src/main/java/com/devday/model/entity/User.java`:
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "team_id")
    private Long teamId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

Create `src/main/java/com/devday/repository/UserRepository.java`:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

#### 2. Flyway Migration
Create `src/main/resources/db/migration/V2__create_users_table.sql`:
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    team_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
```

#### 3. JWT Configuration
Add to `application.yml`:
```yaml
jwt:
  secret: ${JWT_SECRET:change-this-secret-in-production}
  expiration: 86400000  # 24 hours
```

Create `src/main/java/com/devday/security/JwtTokenProvider.java`:
```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }
    
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

#### 4. Security Configuration
Create `src/main/java/com/devday/config/SecurityConfig.java`:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/health", "/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### 5. DTOs
Create `src/main/java/com/devday/model/dto/request/RegisterRequest.java`:
```java
@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String name;
    
    @NotBlank
    @Size(min = 6)
    private String password;
}
```

Create `src/main/java/com/devday/model/dto/request/LoginRequest.java`:
```java
@Data
public class LoginRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String password;
}
```

Create `src/main/java/com/devday/model/dto/response/AuthResponse.java`:
```java
@Data
@Builder
public class AuthResponse {
    private String token;
    private UserResponse user;
}

@Data
@Builder
class UserResponse {
    private Long id;
    private String email;
    private String name;
}
```

#### 6. User Service
Create `src/main/java/com/devday/service/UserService.java`:
```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        
        user = userRepository.save(user);
        
        String token = jwtTokenProvider.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .build())
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtTokenProvider.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .build())
                .build();
    }
    
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
```

#### 7. Auth Controller
Create `src/main/java/com/devday/controller/AuthController.java`:
```java
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(201).body(Map.of(
            "data", response,
            "timestamp", Instant.now()
        ));
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(Map.of(
            "data", response,
            "timestamp", Instant.now()
        ));
    }
}
```

### Do NOT Implement in This Chat
- Task entities (API 3)
- JWT filter for request authentication (simplified for now)
- User profile endpoints beyond basic auth

### Endpoints to Implement
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT |

### Success Criteria
1. ✅ User can register with email/password
2. ✅ Registration returns JWT token
3. ✅ User can login with credentials
4. ✅ Login returns JWT token
5. ✅ Passwords are BCrypt hashed in database
6. ✅ Duplicate email registration fails

### Test Commands
```bash
# Register user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@devday.ai",
    "name": "Test Developer",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@devday.ai",
    "password": "test123"
  }'

# Save the token from response for next APIs
```

### Handoff Block
```markdown
## API 2: User Management & JWT Authentication — COMPLETE ✅
**Completed**: [DATE]
**Files Created**:
- User.java (entity)
- UserRepository.java
- JwtTokenProvider.java
- SecurityConfig.java
- UserService.java
- AuthController.java
- RegisterRequest.java, LoginRequest.java, AuthResponse.java
- V2__create_users_table.sql

**Endpoints Live**:
- POST /api/auth/register
- POST /api/auth/login

**DB Migrations**:
- V2: users table with indexes

**Environment Variables Required**:
- JWT_SECRET (default provided, change in production)

**Known Limitations**:
- No JWT filter yet (will add when needed)
- No /users/me endpoint yet
- Basic error handling

**Next Chat**: Start NEW chat with prompt "API 3: Task Entity & CRUD Operations"
```

---

# API 3: Task Entity & CRUD Operations

## START NEW CHAT — Do not continue from previous API chats

### Context
You are implementing **API 3** of the DevDay AI backend. This API adds the core Task entity with full CRUD operations.

### Prerequisites (Must Be Complete)
- **API 1**: Project setup, health endpoint
- **API 2**: User entity, JWT authentication

### Project State
- Users can register and login
- JWT tokens are generated
- Base package: `com.devday`
- Database: PostgreSQL with users table

### Goal
Implement Task entity with CRUD operations:
1. Create manual tasks
2. List tasks with pagination and filtering
3. Update tasks
4. Delete tasks
5. Support multiple task sources (JIRA, GITHUB, CALENDAR, TEAMS, MANUAL)

### Implement in This Chat Only

#### 1. Enums
Create `src/main/java/com/devday/model/enums/TaskSource.java`:
```java
public enum TaskSource {
    JIRA, GITHUB, CALENDAR, TEAMS, MANUAL
}
```

Create `src/main/java/com/devday/model/enums/TaskStatus.java`:
```java
public enum TaskStatus {
    TODO, IN_PROGRESS, BLOCKED, COMPLETED, CANCELLED
}
```

Create `src/main/java/com/devday/model/enums/TaskPriority.java`:
```java
public enum TaskPriority {
    LOW, MEDIUM, HIGH, URGENT
}
```

#### 2. Task Entity
Create `src/main/java/com/devday/model/entity/Task.java`:
```java
@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "external_id")
    private String externalId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskSource source;
    
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;
    
    @Column(name = "due_date")
    private Instant dueDate;
    
    @Column(name = "completed_at")
    private Instant completedAt;
    
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

#### 3. Flyway Migration
Create `src/main/resources/db/migration/V3__create_tasks_table.sql`:
```sql
CREATE TYPE task_source AS ENUM ('JIRA', 'GITHUB', 'CALENDAR', 'TEAMS', 'MANUAL');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    source task_source NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'TODO',
    priority task_priority NOT NULL DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_source ON tasks(source);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE UNIQUE INDEX idx_tasks_unique_external ON tasks(user_id, source, external_id) 
WHERE external_id IS NOT NULL;
```

#### 4. Repository
Create `src/main/java/com/devday/repository/TaskRepository.java`:
```java
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findByUserId(Long userId, Pageable pageable);
    Page<Task> findByUserIdAndStatus(Long userId, TaskStatus status, Pageable pageable);
    Page<Task> findByUserIdAndSource(Long userId, TaskSource source, Pageable pageable);
    Optional<Task> findByUserIdAndSourceAndExternalId(Long userId, TaskSource source, String externalId);
}
```

#### 5. DTOs
Create `src/main/java/com/devday/model/dto/request/CreateTaskRequest.java`:
```java
@Data
public class CreateTaskRequest {
    @NotBlank
    private String title;
    private String description;
    
    @NotNull
    private TaskSource source;
    
    @NotNull
    private TaskPriority priority;
    
    private Instant dueDate;
}
```

Create `src/main/java/com/devday/model/dto/request/UpdateTaskRequest.java`:
```java
@Data
public class UpdateTaskRequest {
    private String title;
    private String description;
    private TaskPriority priority;
    private Instant dueDate;
}
```

#### 6. Task Service
Create `src/main/java/com/devday/service/TaskService.java`:
```java
@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    
    public Task createTask(Long userId, CreateTaskRequest request) {
        Task task = Task.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .source(request.getSource())
                .priority(request.getPriority())
                .status(TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .build();
        
        return taskRepository.save(task);
    }
    
    public Page<Task> getTasks(Long userId, TaskStatus status, TaskSource source, Pageable pageable) {
        if (status != null && source != null) {
            return taskRepository.findByUserIdAndStatus(userId, status, pageable);
        } else if (status != null) {
            return taskRepository.findByUserIdAndStatus(userId, status, pageable);
        } else if (source != null) {
            return taskRepository.findByUserIdAndSource(userId, source, pageable);
        } else {
            return taskRepository.findByUserId(userId, pageable);
        }
    }
    
    public Task getTask(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return task;
    }
    
    public Task updateTask(Long userId, Long taskId, UpdateTaskRequest request) {
        Task task = getTask(userId, taskId);
        
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long userId, Long taskId) {
        Task task = getTask(userId, taskId);
        taskRepository.delete(task);
    }
}
```

#### 7. Task Controller
Create `src/main/java/com/devday/controller/TaskController.java`:
```java
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {
    
    private final TaskService taskService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody CreateTaskRequest request) {
        Task task = taskService.createTask(userId, request);
        return ResponseEntity.status(201).body(Map.of(
            "data", task,
            "timestamp", Instant.now()
        ));
    }
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getTasks(
            @RequestAttribute("userId") Long userId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskSource source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Task> tasks = taskService.getTasks(userId, status, source, pageable);
        
        return ResponseEntity.ok(Map.of(
            "data", Map.of(
                "items", tasks.getContent(),
                "pagination", Map.of(
                    "page", tasks.getNumber() + 1,
                    "pageSize", tasks.getSize(),
                    "total", tasks.getTotalElements(),
                    "totalPages", tasks.getTotalPages()
                )
            ),
            "timestamp", Instant.now()
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTask(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        Task task = taskService.getTask(userId, id);
        return ResponseEntity.ok(Map.of(
            "data", task,
            "timestamp", Instant.now()
        ));
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        Task task = taskService.updateTask(userId, id, request);
        return ResponseEntity.ok(Map.of(
            "data", task,
            "timestamp", Instant.now()
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        taskService.deleteTask(userId, id);
        return ResponseEntity.noContent().build();
    }
}
```

**Note**: For now, use `@RequestAttribute("userId")` as placeholder. JWT filter will be added later.

### Do NOT Implement in This Chat
- Blocker/OpenLoop entities (API 3B)
- Task status transitions (API 8)
- Integration syncing (APIs 4-6)

### Endpoints to Implement
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/tasks | Create task |
| GET | /api/tasks | Get all tasks (paginated) |
| GET | /api/tasks/{id} | Get single task |
| PATCH | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |

### Success Criteria
1. ✅ Can create manual tasks
2. ✅ Can list tasks with pagination
3. ✅ Can filter by status and source
4. ✅ Can update task fields
5. ✅ Can delete tasks
6. ✅ Unique constraint on (user_id, source, external_id)

### Test Commands
```bash
# Create task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Fix login bug",
    "description": "Users experiencing timeout",
    "source": "MANUAL",
    "priority": "HIGH"
  }'

# Get tasks
curl http://localhost:8080/api/tasks?page=1&size=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update task
curl -X PATCH http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Fix login timeout bug",
    "priority": "URGENT"
  }'

# Delete task
curl -X DELETE http://localhost:8080/api/tasks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Handoff Block
```markdown
## API 3: Task Entity & CRUD Operations — COMPLETE ✅
**Completed**: [DATE]
**Files Created**:
- Task.java (entity)
- TaskRepository.java
- TaskService.java
- TaskController.java
- TaskSource.java, TaskStatus.java, TaskPriority.java (enums)
- CreateTaskRequest.java, UpdateTaskRequest.java
- V3__create_tasks_table.sql

**Endpoints Live**:
- POST /api/tasks
- GET /api/tasks
- GET /api/tasks/{id}
- PATCH /api/tasks/{id}
- DELETE /api/tasks/{id}

**DB Migrations**:
- V3: tasks table with enums and indexes

**Known Limitations**:
- No JWT filter yet (using placeholder @RequestAttribute)
- No status transition validation yet (API 8)
- No integration syncing yet (APIs 4-6)

**Next Chat**: Start NEW chat with prompt "API 3B: Blocker & OpenLoop Entities"
```

---

**[CHAT_SESSION_GUIDE.md continues with APIs 3B through 19...]**

Due to length constraints, I'll create a second part of this file. The pattern continues for all remaining APIs with the same structure:
- START NEW CHAT header
- Context & Prerequisites
- Goal
- Implement in This Chat Only
- Do NOT Implement
- Endpoints
- Success Criteria
- Test Commands
- Handoff Block

Would you like me to continue with the remaining APIs (3B through 19)?