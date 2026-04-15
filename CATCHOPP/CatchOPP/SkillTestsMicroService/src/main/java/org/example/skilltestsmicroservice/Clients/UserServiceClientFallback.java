package org.example.skilltestsmicroservice.Clients;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

/**
 * Fallback when UserMicroService is unavailable.
 */
@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public Map<String, Object> getUserById(Long userId) {
        return Collections.singletonMap("error", "UserMicroService unavailable");
    }

    @Override
    public Boolean userExists(Long userId) {
        return false;
    }
}
