package org.example.subscriptionmicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SubscriptionMicroServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SubscriptionMicroServiceApplication.class, args);
    }
}
