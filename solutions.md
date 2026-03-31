# Containers with Docker - Solutions Guide

This guide provides detailed step-by-step solutions for the Docker exercises. Each solution includes commands, configuration files, and explanations to help you successfully complete the exercises.

---

<details>
<summary>Exercise 0: Clone Git Repository and Explore the Code</summary>
<br />

**Solution:**

**Step 1:** Clone the repository

```bash
git clone git@gitlab.com:twn-devops-bootcamp/latest/07-docker/docker-exercises.git
cd docker-exercises
```

**Step 2:** Remove remote reference and initialize your own repository

```bash
# Remove the existing Git history
rm -rf .git

# Initialize a new Git repository
git init

# Stage all files
git add .

# Create initial commit
git commit -m "initial commit"
```

**Step 3:** Create a repository on GitLab or GitHub and push

First, create a new repository through the web interface, then follow the instructions to upload your code.

**Step 4:** Explore environment variables

Examine the `src/main/java/com/example/DatabaseConfig.java` file to identify the environment variables the application expects:

- `DB_USER` - Database username
- `DB_PWD` - Database password
- `DB_SERVER` - Database host/server address
- `DB_NAME` - Database name

</details>

---

<details>
<summary>Exercise 1: Start MySQL Container</summary>
<br />

**Solution:**

**Step 1:** Create a shared Docker network

```bash
docker network create java-app-network
```

**Step 2:** Start the MySQL container

```bash
docker run --rm -p 3306:3306 \
  --name mysql \
  --network java-app-network \
  -e MYSQL_ROOT_PASSWORD=exampleRootPassword \
  -e MYSQL_DATABASE=team-member-projects \
  -e MYSQL_USER=exampleAdminUser \
  -e MYSQL_PASSWORD=exampleAdminPassword \
  -d mysql:8.3.0
```

**Command breakdown:**

- `--rm` - Automatically removes the container when it stops
- `-p 3306:3306` - Maps container port 3306 to host port 3306
- `--name mysql` - Names the container "mysql" for easy reference
- `--network java-app-network` - Connects the container to the shared network
- `-e MYSQL_ROOT_PASSWORD=exampleRootPassword` - Sets the root user password
- `-e MYSQL_DATABASE=team-member-projects` - Creates a database on startup
- `-e MYSQL_USER=exampleAdminUser` - Creates a non-root user
- `-e MYSQL_PASSWORD=exampleAdminPassword` - Sets the password for the admin user
- `-d` - Runs the container in detached mode (background)
- `mysql:8.3.0` - The official MySQL image from Docker Hub

**Step 3:** Build the Java application

```bash
gradle build
```

This creates the JAR file in `build/libs/docker-exercises-project-1.0-SNAPSHOT.jar`.

**Step 4:** Set environment variables in your terminal for the application

```bash
export DB_USER=exampleAdminUser DB_PWD=exampleAdminPassword DB_SERVER=localhost DB_NAME=team-member-projects
```

These environment variables will be read by the application's `DatabaseConfig.java` file.

**Step 5:** Start the Java application

```bash
java -jar build/libs/docker-exercises-project-1.0-SNAPSHOT.jar
```

**Step 6:** Test the application

Open your browser and navigate to `http://localhost:8080` to verify the application is running and can connect to the database.

**Verification:**

- The application should start without database connection errors
- You should be able to view and interact with the web interface
- Check Docker logs if needed: `docker logs mysql`

</details>

---

<details>
<summary>Exercise 2: Start MySQL GUI Container</summary>
<br />

**Solution:**

**Step 1:** Start the phpMyAdmin container

```bash
docker run --rm -p 8084:80 \
  --name phpmyadmin \
  --network java-app-network \
  -e PMA_HOST=mysql \
  -d phpmyadmin:5.2.3
```

**Command breakdown:**

- `--rm` - Automatically removes the container when it stops
- `-p 8084:80` - Maps container port 80 to host port 8084
- `--name phpmyadmin` - Names the container "phpmyadmin"
- `--network java-app-network` - Connects to the same network as MySQL, allowing phpMyAdmin to resolve the `mysql` hostname
- `-e PMA_HOST=mysql` - Tells phpMyAdmin to connect to the container named "mysql"
- `-d` - Runs in detached mode
- `phpmyadmin:5.2.3` - Official phpMyAdmin image, pinned to a specific version

**Step 2:** Access phpMyAdmin

Open your browser and navigate to: `http://localhost:8084`

**Step 3:** Log in to phpMyAdmin

You can use either of these credentials:

**Admin user:**

- Username: `exampleAdminUser`
- Password: `exampleAdminPassword`

**Root user:**

- Username: `root`
- Password: `exampleRootPassword`

**What to verify:**

- You should see the `team-member-projects` database in the left sidebar
- You can browse tables and view data
- You can execute SQL queries

</details>

---

<details>
<summary>Exercise 3: Use Docker Compose for MySQL and phpMyAdmin</summary>
<br />

**Note:** Stop manually started containers before proceeding

If you started the MySQL and phpMyAdmin containers manually in the previous exercises, you must stop and remove them first to avoid port conflicts with Docker Compose.

```bash
# Stop the running containers
docker stop phpmyadmin mysql

# Verify no containers are using ports 3306 or 8084
docker ps -a
```

**Solution:**

**Step 1:** Create docker-compose.yaml

Create a file named `docker-compose.yaml` in your project root:

**docker-compose.yaml:**

```yaml
services:
  mysql:
    image: mysql:8.3.0
    ports:
      - 3306:3306
    environment:
      - MYSQL_ROOT_PASSWORD=exampleRootPassword
      - MYSQL_DATABASE=team-member-projects
      - MYSQL_USER=exampleAdminUser
      - MYSQL_PASSWORD=exampleAdminPassword
    volumes:
      - mysql-data:/var/lib/mysql
    container_name: mysql

  phpmyadmin:
    image: phpmyadmin:5.2.3
    environment:
      - PMA_HOST=mysql
    ports:
      - 8084:80
    container_name: phpmyadmin
    depends_on:
      - mysql

volumes:
  mysql-data:
    driver: local
```

**Configuration highlights:**

**MySQL service:**

- Uses a named volume `mysql-data` for data persistence
- Data survives container restarts and removals

**phpMyAdmin service:**

- `PMA_HOST=mysql` tells phpMyAdmin to connect to the service named "mysql"
- `depends_on: mysql` ensures MySQL starts before phpMyAdmin
- No `--network java-app-network` needed - Docker Compose creates a network automatically

**Named volume:**

- `mysql-data` persists database data on the host

**Step 2:** Start the containers

```bash
docker compose -f docker-compose.yaml up
```

**Alternative:** Run in detached mode

```bash
docker compose -f docker-compose.yaml up -d
```

**Step 3:** Start the Java application

Start the application as shown in Exercise 1, Steps 4 and 5. Since the app runs on your host machine and MySQL's port is mapped to `localhost`, the same `DB_SERVER=localhost` value still applies.

**Useful Docker Compose commands:**

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs

# View logs for a specific service
docker-compose logs mysql

# Stop containers
docker-compose down

# Stop containers and remove volumes (WARNING: deletes data)
docker-compose down -v

# View real-time logs
docker-compose logs -f
```

</details>

---

<details>
<summary>Exercise 4: Dockerize Your Java Application</summary>
<br />

**Step 1:** Create a Dockerfile

Create a file named `Dockerfile` in your project root:

```dockerfile
# Build stage
FROM gradle:7.6-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src/ ./src/
RUN gradle build

# Runtime stage
FROM openjdk:17.0.2-jre-slim
EXPOSE 8080

RUN groupadd -r javaapp && useradd -r -g javaapp -s /sbin/nologin javaapp \
    && mkdir /opt/app && chown javaapp:javaapp /opt/app

WORKDIR /opt/app
COPY --from=build --chown=javaapp:javaapp /app/build/libs/docker-exercises-project-1.0-SNAPSHOT.jar .

USER javaapp

CMD ["java", "-jar", "docker-exercises-project-1.0-SNAPSHOT.jar"]
```

**Dockerfile breakdown:**

**Build stage:**

- `FROM gradle:7.6-jdk17 AS build` - Uses the official Gradle image with JDK 17 to compile the application inside Docker, so no local Gradle installation is required
- `COPY src/ ./src/` and `COPY build.gradle settings.gradle ./` - Copies only the files Gradle needs to compile the application, keeping the build context clean and avoiding unnecessary cache invalidation from unrelated file changes like README.md or docker-compose.yaml
- `RUN gradle build` - Compiles the application and produces the JAR file

**Runtime stage:**

- `FROM openjdk:17.0.2-jre-slim` - Uses a slim JRE-only image instead of the full JDK, resulting in a significantly smaller final image
- `groupadd -r` and `useradd -r` - Create a dedicated system user and group with no home directory and no password
- `-s /sbin/nologin` - Prevents the user from opening a shell, reducing the attack surface
- `chown javaapp:javaapp /opt/app` - Ensures the application directory is owned by the dedicated user
- `COPY --from=build --chown=javaapp:javaapp` - Copies only the JAR from the build stage into the runtime image, setting the correct ownership in a single step
- `USER javaapp` - Ensures the container process runs as the unprivileged user rather than `root`
- `CMD` - Uses exec form (JSON array) for proper signal handling

**Why multi-stage?**

A multi-stage build separates the build environment from the runtime environment. The final image contains only the JRE and the JAR file — no Gradle, no JDK, no source code — keeping it lean and secure.

</details>

---

<details>
<summary>Exercise 5: Build and Push Java Application Docker Image</summary>
<br />

**Solution:**

**Step 1:** Build the Docker image

```bash
docker build -t {repo-name}/java-app:1.0-SNAPSHOT .
```

Replace `{repo-name}` with your Nexus repository address. For example:

```bash
docker build -t 34.23.223.36:8083/java-app:1.0-SNAPSHOT .
```

**Command breakdown:**

- `docker build` - Build an image from a Dockerfile
- `-t {repo-name}/java-app:1.0-SNAPSHOT` - Tag the image
- `.` - Build context (current directory)

**Step 2:** Log in to your Nexus Docker registry

```bash
docker login {repo-name}
```

Enter your Nexus username and password when prompted.

**Step 3:** Push the image to Nexus

```bash
docker push {repo-name}/java-app:1.0-SNAPSHOT
```

**Verification:**

- Check the Nexus UI to confirm the image appears in your Docker repository
- You should see the image with the tag `1.0-SNAPSHOT`
- Note the image size and layers

</details>

---

<details>
<summary>Exercise 6: Add Application to Docker Compose (Test in your local machine)</summary>
<br />

**Solution:**

**Step 1:** Create docker-compose-with-app.yaml

Create a complete Docker Compose file that includes all three services:

```yaml
services:
  my-java-app:
    image: {repo-name}/java-app:1.0-SNAPSHOT  # Use full image name with your repository
    environment:
      - DB_USER=${DB_USER}
      - DB_PWD=${DB_PWD}
      - DB_SERVER=${DB_SERVER}
      - DB_NAME=${DB_NAME}
    ports:
      - 8080:8080
    container_name: my-java-app
    depends_on:
      mysql:
        condition: service_healthy

  mysql:
    image: mysql
    ports:
      - 3306:3306
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PWD}
    volumes:
      - mysql-data:/var/lib/mysql
    container_name: mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  phpmyadmin:
    image: phpmyadmin
    ports:
      - 8084:80
    environment:
      - PMA_HOST=${PMA_HOST}
      - PMA_PORT=${PMA_PORT}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    container_name: phpmyadmin
    depends_on:
      - mysql

volumes:
  mysql-data:
    driver: local
```

**Key configuration elements:**

**1. Java Application Service:**

- Uses your custom image from Nexus
- Environment variables are parameterized with `${VAR_NAME}` syntax
- `depends_on` with `condition: service_healthy` ensures MySQL is ready before the app starts
- Port 8080 exposed for web access

**2. MySQL Service:**

- Added health check to verify MySQL is ready
- Health check runs `mysqladmin ping` every 10 seconds
- Considered healthy after successful ping

**3. phpMyAdmin Service:**

- Connects to MySQL using service name
- Environment variables for configuration

**Step 2:** Set environment variables

Before starting the containers, set all required environment variables:

```bash
# Database configuration
export DB_USER=exampleAdminUser DB_PWD=exampleAdminPassword DB_SERVER=mysql DB_NAME=team-member-projects

# MySQL root password
export MYSQL_ROOT_PASSWORD=exampleRootPassword

# phpMyAdmin configuration
export PMA_HOST=mysql PMA_PORT=3306
```

**Important notes:**

- `DB_SERVER=mysql` uses the service name (not `localhost`) because containers communicate via Docker's internal network
- Environment variables must be exported before running docker-compose
- These values are substituted into the YAML file at runtime

**Step 3:** Start all containers

```bash
docker-compose -f docker-compose-with-app.yaml up -d
```

**Step 4:** Test the application

1. **Java application:** `http://localhost:8080`
2. **phpMyAdmin:** `http://localhost:8084`

**Why the health check matters:**

Without the health check, your Java application might try to connect to MySQL before it's ready, resulting in connection errors. The health check ensures:

- MySQL is fully initialized
- Database is ready to accept connections
- Application starts only when dependencies are healthy

</details>

---

<details>
<summary>Exercise 7: Run the Application on the Server with Docker Compose</summary>
<br />

**Solution:**

**Step 1:** Configure insecure Docker registry

Since Nexus uses HTTP instead of HTTPS, configure Docker on your server to allow insecure registries.

Create or edit `/etc/docker/daemon.json`:

```bash
sudo nano /etc/docker/daemon.json
```

Add the following content:

```json
{
  "insecure-registries": ["{repo-address}:{repo-port}"]
}
```

**Restart Docker for changes to take effect:**

```bash
sudo systemctl restart docker
```

**Verify the configuration:**

```bash
docker info | grep -A 5 "Insecure Registries"
```

You should see your Nexus repository listed under "Insecure Registries."

**Step 2:** Log in to your Docker registry

```bash
docker login {repo-address}:{repo-port}
```

Enter your Nexus credentials when prompted.

**Step 3:** Fix hardcoded HOST in the application

The application's frontend has `localhost` hardcoded, which won't work on a remote server.

Edit `src/main/resources/static/app.js` (around line 8):

**Before:**

```javascript
const HOST = "localhost";
```

**After:**

```javascript
const HOST = "{server-ip-address}";
```

**Step 4:** Rebuild and push the updated image

```bash
# Rebuild the application
gradle build

# Build the Docker image
docker build -t {repo-name}/java-app:1.0-SNAPSHOT .

# Push to Nexus
docker push {repo-name}/java-app:1.0-SNAPSHOT
```

**Step 5:** Copy docker-compose.yaml to the server

```bash
scp -i ~/.ssh/id_rsa docker-compose-with-app.yaml {server-user}@{server-ip}:/home/{server-user}/
```

**Alternative:** If you have password authentication enabled

```bash
scp docker-compose-with-app.yaml {server-user}@{server-ip}:/home/{server-user}/
```

**Step 6:** SSH into the server

```bash
ssh -i ~/.ssh/id_rsa {server-user}@{server-ip}
```

Or:

```bash
ssh {server-user}@{server-ip}
```

**Step 7:** Set environment variables on the server

On the remote server, export all required environment variables:

```bash
# Database configuration
export DB_USER=exampleAdminUser DB_PWD=exampleAdminPassword DB_SERVER=mysql DB_NAME=team-member-projects

# MySQL root password
export MYSQL_ROOT_PASSWORD=exampleRootPassword

# phpMyAdmin configuration
export PMA_HOST=mysql PMA_PORT=3306
```

**Step 8:** Start the application

```bash
docker-compose -f docker-compose-with-app.yaml up -d
```

**Step 9:** Verify deployment

```bash
# Check container status
docker-compose -f docker-compose-with-app.yaml ps

# View logs
docker-compose -f docker-compose-with-app.yaml logs

# Check if all containers are running
docker ps
```

**What you should see:**

- Three containers running: `my-java-app`, `mysql`, `phpmyadmin`
- All containers in "Up" state
- No error messages in logs

**Note:** You won't be able to access the application from your browser yet - that's what Exercise 8 addresses!

**Persistent environment variables:**

To avoid re-exporting variables every time you log in, add them to `~/.bashrc` or create a `.env` file:

```bash
# Create .env file
cat > .env << EOF
DB_USER=admin
DB_PWD=adminpass
DB_SERVER=mysql
DB_NAME=team-member-projects
MYSQL_ROOT_PASSWORD=rootpass
PMA_HOST=mysql
PMA_PORT=3306
EOF

# Source it before running docker-compose
source .env
docker-compose -f docker-compose-with-app.yaml up -d
```

</details>

---

<details>
<summary>Exercise 8: Configure Firewall and Access the Application</summary>
<br />

**Solution:**

Your application is now running on the server, but the firewall is blocking external access. You need to open the necessary ports.

**Step 1:** Identify which ports to open

From your docker-compose file, you're exposing:

- **8080** - Java application
- **8084** - phpMyAdmin (optional, for database management)
- **3306** - MySQL (typically should NOT be exposed externally for security)

**Step 2:** Verify functionality

Test the application thoroughly:

1. ✅ Load the main page
2. ✅ Create or edit data
3. ✅ Verify changes are saved to the database
4. ✅ Check phpMyAdmin to see the data persisted
