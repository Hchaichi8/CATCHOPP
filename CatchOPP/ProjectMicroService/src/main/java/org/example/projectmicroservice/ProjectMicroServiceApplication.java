package org.example.projectmicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ProjectMicroServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectMicroServiceApplication.class, args);
    }

}
