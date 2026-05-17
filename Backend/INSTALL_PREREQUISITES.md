# Install Prerequisites for DevDay AI Backend

This guide will help you install Java, Maven, and Docker on Windows 11.

---

## 1. Install Java Development Kit (JDK 17)

### Download and Install
1. Go to https://adoptium.net/
2. Download **Eclipse Temurin JDK 17** (LTS) for Windows x64
3. Run the installer
4. **Important**: Check "Set JAVA_HOME variable" during installation
5. **Important**: Check "Add to PATH" during installation

### Verify Installation
Open a **NEW** PowerShell or Command Prompt window:
```powershell
java -version
```

Expected output:
```
openjdk version "17.0.x" 2024-xx-xx
OpenJDK Runtime Environment Temurin-17.0.x (build 17.0.x+x)
OpenJDK 64-Bit Server VM Temurin-17.0.x (build 17.0.x+x, mixed mode, sharing)
```

### Manual Configuration (if needed)
If `java -version` doesn't work:

1. **Set JAVA_HOME**:
   - Right-click "This PC" → Properties → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (adjust path)
   - Click OK

2. **Add to PATH**:
   - In "System variables", find and select "Path"
   - Click "Edit" → "New"
   - Add: `%JAVA_HOME%\bin`
   - Click OK

3. **Restart** your terminal and test again

---

## 2. Install Apache Maven

### Download and Install
1. Go to https://maven.apache.org/download.cgi
2. Download **Binary zip archive** (e.g., apache-maven-3.9.9-bin.zip)
3. Extract to `C:\Program Files\Maven\apache-maven-3.9.9`

### Configure Environment Variables
1. **Set MAVEN_HOME**:
   - Right-click "This PC" → Properties → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", click "New"
   - Variable name: `MAVEN_HOME`
   - Variable value: `C:\Program Files\Maven\apache-maven-3.9.9`
   - Click OK

2. **Set M2_HOME** (optional but recommended):
   - Variable name: `M2_HOME`
   - Variable value: `C:\Program Files\Maven\apache-maven-3.9.9`
   - Click OK

3. **Add to PATH**:
   - In "System variables", find and select "Path"
   - Click "Edit" → "New"
   - Add: `%MAVEN_HOME%\bin`
   - Click OK

4. **Apply Changes**:
   - Click OK on all dialogs
   - **Close and reopen** your terminal

### Verify Installation
Open a **NEW** PowerShell or Command Prompt window:
```powershell
mvn -version
```

Expected output:
```
Apache Maven 3.9.9 (...)
Maven home: C:\Program Files\Maven\apache-maven-3.9.9
Java version: 17.0.x, vendor: Eclipse Adoptium
Default locale: en_US, platform encoding: UTF-8
OS name: "windows 11", version: "10.0", arch: "amd64"
```

---

## 3. Install Docker Desktop

### Download and Install
1. Go to https://www.docker.com/products/docker-desktop/
2. Download **Docker Desktop for Windows**
3. Run the installer
4. **Important**: Enable WSL 2 during installation (recommended)
5. Restart your computer when prompted

### Start Docker Desktop
1. Launch Docker Desktop from Start Menu
2. Wait for Docker to start (whale icon in system tray should be steady)
3. Accept the Docker Subscription Service Agreement if prompted

### Verify Installation
Open PowerShell or Command Prompt:
```powershell
docker --version
docker compose version
```

Expected output:
```
Docker version 24.x.x, build xxxxxxx
Docker Compose version v2.x.x
```

### Test Docker
```powershell
docker run hello-world
```

Should download and run a test container successfully.

---

## 4. Verify All Prerequisites

Run this verification script in PowerShell:

```powershell
Write-Host "=== Checking Prerequisites ===" -ForegroundColor Cyan

# Check Java
Write-Host "`nJava:" -ForegroundColor Yellow
java -version

# Check Maven
Write-Host "`nMaven:" -ForegroundColor Yellow
mvn -version

# Check Docker
Write-Host "`nDocker:" -ForegroundColor Yellow
docker --version
docker compose version

Write-Host "`n=== All Prerequisites Checked ===" -ForegroundColor Green
```

---

## Troubleshooting

### Java Issues
- **"java is not recognized"**: Ensure JAVA_HOME is set and %JAVA_HOME%\bin is in PATH
- **Wrong version**: Uninstall old Java versions, install JDK 17
- **JAVA_HOME not set**: Manually set as described above

### Maven Issues
- **"mvn is not recognized"**: Ensure MAVEN_HOME is set and %MAVEN_HOME%\bin is in PATH
- **"JAVA_HOME is not set"**: Maven requires JAVA_HOME to be set
- **Slow downloads**: First run downloads many dependencies, be patient

### Docker Issues
- **Docker Desktop won't start**: Enable Virtualization in BIOS
- **WSL 2 error**: Install WSL 2 from Microsoft Store
- **Permission denied**: Run Docker Desktop as Administrator once

---

## Next Steps

Once all prerequisites are installed:

1. Navigate to Backend directory:
   ```powershell
   cd s:\DevDay-AI\Backend
   ```

2. Start PostgreSQL:
   ```powershell
   docker compose up -d
   ```

3. Build and run application:
   ```powershell
   mvn clean install
   mvn spring-boot:run
   ```

4. Test health endpoint:
   ```powershell
   curl http://localhost:8080/api/health
   ```

---

**Ready to proceed!** 🚀