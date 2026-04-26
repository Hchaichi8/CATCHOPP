# ─────────────────────────────────────────────────────────────
#  Stage 1 – Build
#  IMPORTANT: Build context must be CatchOPP/ (parent directory)
#  because ProjectMicroService depends on ReferralMicroService
#  as a local Maven artifact.
#
#  Build command from CatchOPP/ directory:
#    docker build -f ProjectMicroService/Dockerfile -t <image> .
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# ── Step 1: Install ReferralMicroService into local Maven repo ──
COPY ReferralMicroService/mvnw       ./ReferralMicroService/mvnw
COPY ReferralMicroService/mvnw.cmd   ./ReferralMicroService/mvnw.cmd
COPY ReferralMicroService/pom.xml    ./ReferralMicroService/pom.xml
COPY ReferralMicroService/.mvn       ./ReferralMicroService/.mvn
COPY ReferralMicroService/src        ./ReferralMicroService/src

RUN chmod +x ReferralMicroService/mvnw \
    && cd ReferralMicroService \
    && ./mvnw install -DskipTests -B

# ── Step 2: Build ProjectMicroService ───────────────────────
COPY ProjectMicroService/mvnw       ./ProjectMicroService/mvnw
COPY ProjectMicroService/mvnw.cmd   ./ProjectMicroService/mvnw.cmd
COPY ProjectMicroService/pom.xml    ./ProjectMicroService/pom.xml
COPY ProjectMicroService/.mvn       ./ProjectMicroService/.mvn

RUN chmod +x ProjectMicroService/mvnw \
    && cd ProjectMicroService \
    && ./mvnw dependency:go-offline -B

COPY ProjectMicroService/src ./ProjectMicroService/src

RUN cd ProjectMicroService && ./mvnw package -DskipTests -B

# ─────────────────────────────────────────────────────────────
#  Stage 2 – Runtime
# ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S catchopp && adduser -S catchopp -G catchopp
USER catchopp

COPY --from=builder /app/ProjectMicroService/target/ProjectMicroService-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
