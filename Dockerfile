FROM gradle:7.6-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src/ ./src/
RUN gradle build

FROM openjdk:17.0.2-jre-slim
EXPOSE 8080

RUN groupadd -r javaapp && useradd -r -g javaapp -s /sbin/nologin javaapp \
    && mkdir /opt/app && chown javaapp:javaapp /opt/app

WORKDIR /opt/app
COPY --from=build --chown=javaapp:javaapp /app/build/libs/docker-exercises-project-1.0-SNAPSHOT.jar .

USER javaapp

CMD ["java", "-jar", "docker-exercises-project-1.0-SNAPSHOT.jar"]
