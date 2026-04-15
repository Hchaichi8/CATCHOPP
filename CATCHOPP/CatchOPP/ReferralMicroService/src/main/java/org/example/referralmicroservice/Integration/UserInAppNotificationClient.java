package org.example.referralmicroservice.Integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class UserInAppNotificationClient {

    private static final Logger log = LoggerFactory.getLogger(UserInAppNotificationClient.class);

    @Value("${catchopp.user-service.base-url:http://localhost:8081}")
    private String userServiceBase;

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(Long userId, String type, String title, String body, String link, String dedupeKey) {
        if (userId == null) {
            return;
        }
        String url = userServiceBase + "/User/notifications/internal";
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("type", type);
        payload.put("title", title);
        payload.put("body", body);
        if (link != null) {
            payload.put("link", link);
        }
        if (dedupeKey != null && !dedupeKey.isBlank()) {
            payload.put("dedupeKey", dedupeKey);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        try {
            restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), Void.class);
        } catch (RestClientException e) {
            log.warn("Could not send in-app notification to User service: {}", e.getMessage());
        }
    }
}
