package org.example.apigetway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class ApigetwayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApigetwayApplication.class, args);
    }

    @Bean
    public RouteLocator gatewayroute(RouteLocatorBuilder builder){

        return builder.routes()
                .route("idroute1condidat",r->r.path("/candidats/**")
                        .uri("lb://MSCandidat4SAE7"))
                .route("idroute1jobs",r->r.path("/jobs/**")
                        .uri("lb://MS-job-s"))
                .build();
    }

}
