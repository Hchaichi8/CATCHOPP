package tn.esprit.communitymicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableDiscoveryClient
@EnableFeignClients
public class CommunityMicroServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommunityMicroServiceApplication.class, args);
    }

}
