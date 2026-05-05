package tn.esprit.communitymicroservice.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.communitymicroservice.dto.UserDTO;

import java.util.List;

/**
 * Feign client for UserMicroService.
 *
 * - name: must match spring.application.name of UserMicroService (used by Eureka)
 * - url:  fallback direct URL if Eureka is not available
 */
@FeignClient(
    name = "UserMicroService",
    url  = "${user-service.url:http://localhost:8083}"
)
public interface UserClient {

    // GET /users/{id}  →  single user
    @GetMapping("/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    // GET /users/all  →  all users (admin use)
    @GetMapping("/users/all")
    List<UserDTO> getAllUsers();
}
