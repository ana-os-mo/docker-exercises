# Containers with Docker - Practice Exercises

## Scenario

Your team member has enhanced the static Java application you worked on previously by adding MySQL database connectivity. The application now allows users to edit information and persist their changes to a database.

Your task is to containerize this application stack and deploy it using Docker and Docker Compose. This will make the application easy to run consistently across different environments and simple for your team to deploy.

By the end of these exercises, you'll have a complete containerized application with:

- A Java backend application
- A MySQL database
- A phpMyAdmin web interface for database management

All components will be orchestrated using Docker Compose and deployed to a remote server.

## EXERCISE 0: Clone Git Repository and Explore the Code

**Objective:** Understand the application structure and environment variable usage.

Clone the repository and examine the code changes. You'll notice that the application uses environment variables for database configuration and credentials rather than hardcoded values.

**Why this matters:**

**Security:** Database passwords and sensitive credentials should never be hardcoded in your application code or committed to version control. Using environment variables keeps this information secure.

**Flexibility:** Database connection details (host, port, credentials) often differ between environments (development, staging, production). Environment variables allow you to configure these dynamically at deployment time without modifying code.

Take time to identify which environment variables the application expects and what they're used for. This will be important for the following exercises.

## EXERCISE 1: Start MySQL Container

**Objective:** Run MySQL as a Docker container and connect your application to it.

Before deploying to a server, you want to test the application locally with a MySQL database. Instead of installing MySQL directly on your machine, you'll run it as a Docker container for a faster, cleaner setup.

**Tasks:**

1. Start a MySQL container using the official Docker image from Docker Hub
2. Configure all required environment variables (root password, database name, user credentials)
3. Export the necessary environment variables for your Java application to connect to the database
   - Check the application code to identify the required variable names
4. Build the JAR file for your application
5. Start the application locally
6. Test the application in your browser and make some changes to verify database connectivity

**What you'll learn:**

- How to run databases as containers
- How to configure containerized applications using environment variables
- How to connect applications to containerized services

## EXERCISE 2: Start MySQL GUI Container

**Objective:** Deploy phpMyAdmin to visually manage your MySQL database.

Now that you have a running database, you want a graphical interface to view and manage the data. phpMyAdmin is a popular web-based MySQL administration tool. Rather than installing it locally, you'll run it as a Docker container.

**Tasks:**

1. Start a phpMyAdmin container using the official Docker image
2. Configure it to connect to your MySQL container
3. Access phpMyAdmin from your browser
4. Log in to your MySQL database and verify you can see the tables and data

**Tips:**

- phpMyAdmin needs to know how to reach your MySQL container (hostname/IP and port)
- Remember the MySQL credentials you set in Exercise 1
- phpMyAdmin typically runs on port 80 by default

## EXERCISE 3: Use Docker Compose for MySQL and phpMyAdmin

**Objective:** Orchestrate multiple containers using Docker Compose.

Managing multiple containers with separate `docker run` commands is tedious and error-prone. Docker Compose allows you to define and run multi-container applications with a single configuration file.

**Tasks:**

1. Create a `docker-compose.yml` file that defines both containers (MySQL and phpMyAdmin)
2. Configure a Docker volume for your MySQL database to persist data between container restarts
3. Start both containers using Docker Compose
4. Verify that everything works as before

**What you'll learn:**

- How to define multi-container applications in YAML format
- How to configure Docker volumes for data persistence
- How to use Docker Compose commands to manage your application stack

**Benefits:**

- Single command to start/stop all services
- Automatic network creation for container communication
- Reproducible infrastructure as code

## EXERCISE 4: Dockerize Your Java Application

**Objective:** Create a Docker image for your Java application.

You've successfully tested the application locally with the MySQL database. Now you want to deploy it to a server so your team can access it. Since your database and database UI are already running as containers, it makes sense to containerize your Java application as well.

This will allow you to:

- Start the entire stack (app + database + UI) with a single Docker Compose command
- Ensure consistency across different environments
- Simplify deployment and scaling

**Task:**

Create a `Dockerfile` for your Java application that:

- Uses an appropriate base image (e.g., a Java runtime image)
- Copies your JAR file into the image
- Exposes the necessary port
- Defines the command to run your application

**Considerations:**

- Choose the right base image for your Java version
- Consider using a multi-stage build to keep the image size small
- Make sure environment variables can be passed at runtime

## EXERCISE 5: Build and Push Java Application Docker Image

**Objective:** Store your Docker image in a container registry for deployment.

To run your Java application as a Docker container on a remote server, the image must be accessible from that server. You'll store it in a Docker registry so you can pull it from anywhere.

**Tasks:**

1. Create a Docker hosted repository on your Nexus server
   - This will serve as your private container registry
2. Build your Docker image locally using the Dockerfile from Exercise 4
3. Tag the image appropriately for your Nexus repository
4. Push the image to your Nexus Docker registry

**Why use a private registry?**

- Control over your images
- Faster pulls within your network
- Security for proprietary applications
- Integration with your existing Nexus infrastructure

## EXERCISE 6: Add Application to Docker Compose

**Objective:** Complete your Docker Compose configuration with all three services.

Now you'll add your Java application to the Docker Compose file, creating a complete multi-container application stack.

**Tasks:**

1. Add your Java application's Docker image to the `docker-compose.yml` file
2. Configure all required environment variables for the application
3. Set up service dependencies and health checks
4. Make environment variables configurable

    Your Docker Compose file will be committed to version control, so it shouldn't contain sensitive data like passwords. Use environment variable substitution to make these values configurable from outside the compose file. This allows you to set these values on the server at deployment time without modifying the compose file.

**Important:** Configure MySQL health check

Add a health check to your MySQL service to ensure it's fully ready before your application starts:

```yaml
my-java-app:
  depends_on:
    mysql:
      condition: service_healthy

mysql:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 10s
    timeout: 5s
    retries: 5
```

This prevents connection errors that occur when the application tries to connect to MySQL before it's ready.

**What you'll learn:**

- How to orchestrate multiple custom containers
- Service dependencies and startup ordering
- Health checks for reliable multi-container applications
- Secure configuration management with environment variables

## EXERCISE 7: Run Application on Server with Docker Compose

**Objective:** Deploy your complete containerized application stack to a remote server.

Your Docker Compose configuration is complete. Now it's time to deploy everything to your server and make the application accessible to your team.

**Tasks:**

1. **Configure insecure Docker registry on the server**

    Since your Nexus repository uses HTTP instead of HTTPS, you need to configure Docker on the server to allow insecure registries:
    - Edit Docker daemon configuration to trust your Nexus registry
    - Restart the Docker service

2. **Authenticate with your Docker registry**

    Run `docker login` on the server to authenticate with your Nexus repository. This allows Docker to pull your private images.

3. **Fix hardcoded localhost references**

    Your application's `app.js` currently has `localhost` hardcoded as the backend host. This works locally but will fail on a remote server.
    - Update the code to use the server's IP address instead
    - Rebuild the Docker image with this fix
    - Push the updated image to Nexus
    - Update the image tag in `docker-compose.yml` if necessary

4. **Copy Docker Compose file to the server**

    Transfer your `docker-compose.yml` file to the server.

5. **Set environment variables on the server**

    Export all required environment variables before running Docker Compose.

6. **Start the application stack**

Use docker-compose to start all three containers in detached mode.

**Verification:**

- Check that all containers are running: `docker-compose ps`
- View logs if needed: `docker-compose logs`
- Verify the application is responding (though you won't be able to access it from outside yet - that's Exercise 8)

## EXERCISE 8: Configure Firewall and Access the Application

**Objective:** Make your application accessible from the internet.

Your application is running successfully on the server, but you still can't access it from your browser. This is because the server's firewall is blocking incoming traffic on your application's port. You need to configure the firewall to allow access.

**Tasks:**

1. Identify which port your application is listening on (check your Docker Compose file)
2. Open the necessary port on the server's firewall
3. Test access from your browser using `http://<server-ip>:<port>`
4. Verify you can:
   - Access the application interface
   - Make changes and save data
   - View the database through phpMyAdmin (if you exposed its port)

Your team can now access and use the application!
