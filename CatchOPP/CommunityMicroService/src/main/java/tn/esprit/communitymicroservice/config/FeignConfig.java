package tn.esprit.communitymicroservice.config;

import feign.Logger;
import feign.Request;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.concurrent.TimeUnit;

/**
 * Global Feign configuration:
 *  - Timeouts
 *  - JWT forwarding (passes the incoming Authorization header to downstream services)
 *  - Logging level
 */
@Configuration
public class FeignConfig {

    // ── Timeouts ──────────────────────────────────────────────────────────
    @Bean
    public Request.Options requestOptions() {
        return new Request.Options(
                5,  TimeUnit.SECONDS,   // connect timeout
                10, TimeUnit.SECONDS,   // read timeout
                true                    // follow redirects
        );
    }

    // ── JWT forwarding ────────────────────────────────────────────────────
    // Automatically forwards the Authorization: Bearer <token> header
    // from the incoming request to every outgoing Feign call.
    @Bean
    public RequestInterceptor jwtForwardingInterceptor() {
        return requestTemplate -> {
            // Try to get the token from the current HTTP request
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attrs != null) {
                String authHeader = attrs.getRequest().getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    requestTemplate.header("Authorization", authHeader);
                }
            }
        };
    }

    // ── Logging ───────────────────────────────────────────────────────────
    // FULL logs in dev — change to NONE or BASIC in production
    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.BASIC;
    }
}
