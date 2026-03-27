# 🔍 Eureka Server - Service Discovery

## What is This?

This is the **Eureka Service Discovery Server** for the CatchOPP microservices architecture.

It acts as a registry where all microservices can register themselves and discover other services.

---

## 🚀 How to Start

### Option 1: Using Batch File (Windows)
```cmd
START_EUREKA.bat
```

### Option 2: Using Maven
```cmd
mvn spring-boot:run
```

### Option 3: Using Java
```cmd
mvn clean package
java -jar target/eureka-server-1.0.0.jar
```

---

## 📊 Access Eureka Dashboard

Once started, open your browser:

```
http://localhost:8761
```

You'll see all registered microservices and their status.

---

## ⚙️ Configuration

**Port**: 8761 (default Eureka port)

**Properties**: `src/main/resources/application.properties`

```properties
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

---

## 🔗 How Microservices Connect

Your microservices are already configured with Eureka Client dependency.

To enable them to register with Eureka, update their `application.properties`:

```properties
# Enable Eureka Client
eureka.client.enabled=true
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

---

## ✅ Current Status

- ✅ Eureka Server created
- ✅ Configured on port 8761
- ✅ Dashboard enabled
- ⚠️ Microservices still have Eureka DISABLED (they work independently)

---

## 🎯 Benefits

When microservices register with Eureka:

1. **Service Discovery**: Services find each other automatically
2. **Load Balancing**: Distribute traffic across multiple instances
3. **Health Monitoring**: Track which services are alive
4. **Dynamic Routing**: No hardcoded URLs needed

---

## 📝 Notes

- This Eureka Server is **completely independent**
- Your existing microservices will continue to work normally
- Eureka is **optional** - services work with or without it
- To use Eureka, you need to enable it in each microservice

---

## 🔧 Troubleshooting

### Port 8761 already in use?

Change the port in `application.properties`:
```properties
server.port=8762
```

### Can't access dashboard?

Make sure the server started successfully. Check console for errors.

### Services not showing up?

Services need to have `eureka.client.enabled=true` in their configuration.

---

## 📚 Learn More

See `EUREKA_EXPLAINED.md` in the project root for detailed explanation.

