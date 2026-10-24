# syntax=docker/dockerfile:1.7

FROM maven:3.9.11-eclipse-temurin-21-alpine AS build

WORKDIR /workspace

COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp dependency:go-offline

COPY src/main ./src/main
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp -DskipTests package \
    && java -Djarmode=tools -jar target/taskstream-0.0.1-SNAPSHOT.jar \
       extract --layers --destination /workspace/layers \
    && jlink \
       --add-modules java.base,java.compiler,java.desktop,java.instrument,java.management,java.naming,java.net.http,java.security.jgss,java.security.sasl,java.sql,java.xml,jdk.crypto.ec,jdk.unsupported,jdk.zipfs \
       --strip-debug --no-header-files --no-man-pages --compress=zip-6 \
       --output /workspace/jre

FROM alpine:3.24 AS runtime

WORKDIR /app
RUN apk add --no-cache ca-certificates libstdc++ \
    && addgroup -S spring \
    && adduser -S spring -G spring

COPY --from=build /workspace/jre/ /opt/java/openjdk/
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

COPY --from=build --chown=spring:spring /workspace/layers/dependencies/ ./
COPY --from=build --chown=spring:spring /workspace/layers/spring-boot-loader/ ./
COPY --from=build --chown=spring:spring /workspace/layers/snapshot-dependencies/ ./
COPY --from=build --chown=spring:spring /workspace/layers/application/ ./

USER spring:spring
EXPOSE 8000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-cp", "/app/taskstream-0.0.1-SNAPSHOT.jar:/app/lib/*", "com.elkay.taskstream.TaskstreamApplication"]
