# API 1 Verification Checklist

## Prerequisites Installation

Before running the application, install these tools:

### 1. Java 17 or Higher
```bash
# Check if Java is installed
java -version

# Should show: java version "17.x.x" or higher
```

**Download**: https://adoptium.net/ (Eclipse Temurin JDK 17)

### 2. Maven 3.8+
```bash
# Check if Maven is installed
mvn --version

# Should show: Apache Maven 3.8.x or higher
```

**Download**: https://maven.apache.org/download.cgi

### 3. Docker Desktop
```bash
# Check if Docker is installed
docker --version
docker compose version

# Should show Docker version and Docker Compose version
```

**Download**: https://www.docker.com/products/docker-desktop/

---

## Verification Steps

### Step 1: Start PostgreSQL ✅
```bash
cd Backend
docker compose up -d
```

**Expected Output**:
```
[+] Running 2/2
 ✔ Network backend_devday-network  Created
 ✔ Container devday-postgres        Started
```

**Verify**:
```bash
docker ps
```

Should show `devday-postgres` container running on port 5432.

---

### Step 2: Build Application ✅
```bash
# From Backend directory
mvn clean install
```

**Expected Output**:
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX.XXX s
```

---

### Step 3: Run Application ✅
```bash
mvn spring-boot:run
```

**Expected Output**:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

...
Started DevDayApplication in X.XXX seconds
```

Application should start on port 8080.

---

### Step 4: Test Health Endpoint ✅
```bash
curl http://localhost:8080/api/health
```

**Expected Response**:
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2026-05-16T13:30:00Z"
}
```

**Alternative (Browser)**:
Open http://localhost:8080/api/health in your browser.

---

### Step 5: Verify Flyway Migration ✅
```bash
# Connect to PostgreSQL
docker exec -it devday-postgres psql -U devday -d devday_ai

# Check Flyway schema history
SELECT * FROM flyway_schema_history;

# Should show V1 migration executed successfully
# Exit with \q
```

---

## Troubleshooting

### Issue: Port 8080 Already in Use
```bash
# Windows - Find process using port 8080
netstat -ano | findstr :8080

# Kill the process or change port in application.yml
# Set PORT environment variable
set PORT=8081
mvn spring-boot:run
```

### Issue: PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running
docker ps

# Check PostgreSQL logs
docker logs devday-postgres

# Restart PostgreSQL
docker compose restart postgres

# Verify connection manually
docker exec -it devday-postgres psql -U devday -d devday_ai -c "SELECT 1;"
```

### Issue: Maven Build Failed
```bash
# Clean Maven cache
mvn clean

# Try with verbose output
mvn clean install -X

# Check Java version
java -version
# Must be Java 17 or higher
```

### Issue: Flyway Migration Failed
```bash
# Check migration files
ls src/main/resources/db/migration/

# Reset database (CAUTION: Deletes all data)
docker compose down -v
docker compose up -d

# Run application again
mvn spring-boot:run
```

---

## Success Indicators

✅ **All Green** if you see:
1. PostgreSQL container running (`docker ps`)
2. Maven build successful (`BUILD SUCCESS`)
3. Application starts without errors
4. Health endpoint returns `{"status":"UP","database":"connected"}`
5. Flyway migration V1 executed (check `flyway_schema_history` table)

---

## Next Steps

Once all verification steps pass:

1. ✅ Mark API 1 as complete
2. 🔄 Start a **NEW CHAT** for API 2
3. 📝 Use the prompt from [`PROGRESS.md`](PROGRESS.md) for API 2

---

**API 1 Complete!** 🎉  
Ready for API 2: User Management & JWT Authentication