# ─────────────────────────────────────────────
#  Stage 1 – Build
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy pom first (layer-cache friendly)
COPY pom.xml ./
COPY .mvn .mvn

# Download dependencies without compiling sources
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src src
RUN mvn package -DskipTests -B

# ─────────────────────────────────────────────
#  Stage 2 – Runtime
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S catchopp && adduser -S catchopp -G catchopp
USER catchopp

COPY --from=builder /app/target/CommunityMicroService-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.jar"]
