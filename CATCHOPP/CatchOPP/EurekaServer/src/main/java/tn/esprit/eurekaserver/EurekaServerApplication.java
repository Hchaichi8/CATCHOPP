package tn.esprit.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka Service Discovery Server for CatchOPP Microservices
 * 
 * This server acts as a registry where all microservices register themselves.
 * Other services can discover and communicate with each other through this registry.
 * 
 * Access the Eureka Dashboard at: http://localhost:8761
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("✅ Eureka Server Started Successfully!");
        System.out.println("========================================");
        System.out.println("📊 Dashboard: http://localhost:8761");
        System.out.println("========================================\n");
    }
}
