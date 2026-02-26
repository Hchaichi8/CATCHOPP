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
                .route("idroute1project", r -> r.path("/Project/**")
                        .uri("lb://PROJECTMICROSERVICE"))
                .route("idroute1user", r -> r.path("/users/**")
                        .uri("lb://USERMICROSERVICE"))
                .route("idroute1contract", r -> r.path("/Contract/**")
                        .uri("lb://PROJECTMICROSERVICE"))

                .route("idroute1CompetanceETreview", r -> r.path("/Competance/**")
                        .uri("lb://MSCOMPETENCEANDREVIEW"))

                .route("idroute2CompetanceETreview", r -> r.path("/Review/**")
                        .uri("lb://MSCOMPETENCEANDREVIEW"))
                .build();
    }

}
