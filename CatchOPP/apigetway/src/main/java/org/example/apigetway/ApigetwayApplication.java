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
    public RouteLocator gatewayroute(RouteLocatorBuilder builder) {
        return builder.routes()

                // ── Existing microservices ────────────────────────────────
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

                .route("idroutepayment", r -> r.path("/api/payments/**", "/api/disputes/**")
                        .uri("lb://PAIEMENTMS"))

                .route("idroutesupport", r -> r.path("/api/tickets/**", "/ws-support/**")
                        .uri("http://catchopp-support-ms:8087"))

                .route("idroutechat", r -> r.path("/chat/**", "/ws/**")
                        .uri("http://catchopp-communication-ms:8086"))

                // ── CommunityMicroService routes ──────────────────────────

                // Groups CRUD
                .route("community-groups", r -> r.path("/api/groups/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Events CRUD + approve/reject/pending
                .route("community-events", r -> r.path("/api/events/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Clubs CRUD + pause/unpause/search
                .route("community-clubs", r -> r.path("/api/clubs/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Posts CRUD + group/club/engagement
                .route("community-posts", r -> r.path("/api/posts/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Comments CRUD + count
                .route("community-comments", r -> r.path("/api/comments/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Post reactions
                .route("community-reactions", r -> r.path("/api/reactions/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Comment reactions
                .route("community-comment-reactions", r -> r.path("/api/comment-reactions/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Group members + enriched
                .route("community-group-members", r -> r.path("/api/group-members/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Join requests (INVITE_ONLY groups)
                .route("community-join-requests", r -> r.path("/api/join-requests/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Reports / signalements
                .route("community-reports", r -> r.path("/api/reports/**")
                        .uri("lb://COMMUNITYMICROSERVICE"))

                // Swagger / OpenAPI docs for CommunityMicroService
                .route("community-swagger", r -> r.path("/community/api-docs/**", "/community/swagger-ui/**")
                        .filters(f -> f.rewritePath("/community/(?<segment>.*)", "/${segment}"))
                        .uri("lb://COMMUNITYMICROSERVICE"))

                .build();
    }
}

