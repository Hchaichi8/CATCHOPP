package org.example.skilltestsmicroservice.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

/**
 * OpenFeign client for UserMicroService.
 * Uses Eureka service discovery — no hardcoded URL needed.
 */
@FeignClient(name = "UserMicroService", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    @GetMapping("/api/users/{userId}")
    Map<String, Object> getUserById(@PathVariable("userId") Long userId);

    @GetMapping("/api/users/exists/{userId}")
    Boolean userExists(@PathVariable("userId") Long userId);
}
