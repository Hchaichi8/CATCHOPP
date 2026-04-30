package org.example.skilltestsmicroservice.Controllers;

import org.example.skilltestsmicroservice.Clients.UserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Test controller to verify OpenFeign communication
 * between SkillTestsMicroService → UserMicroService
 */
@RestController
@RequestMapping("/SkillTests/feign-test")
@CrossOrigin(origins = "*")
public class FeignTestController {

    @Autowired
    private UserServiceClient userServiceClient;

    @GetMapping("/user/{userId}")
    public Map<String, Object> getUserFromUserService(@PathVariable Long userId) {
        System.out.println(">>> Feign call: fetching user " + userId + " from UserMicroService");
        Map<String, Object> user = userServiceClient.getUserById(userId);
        System.out.println(">>> Feign response: " + user);
        return user;
    }

    @GetMapping("/user/{userId}/exists")
    public Map<String, Object> checkUserExists(@PathVariable Long userId) {
        System.out.println(">>> Feign call: checking if user " + userId + " exists");
        Boolean exists = userServiceClient.userExists(userId);
        System.out.println(">>> Feign response: exists=" + exists);
        return Map.of("userId", userId, "exists", exists);
    }
}
