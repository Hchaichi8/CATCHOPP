package org.example.skilltestsmicroservice.Integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class SubscriptionAiAccessClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${catchopp.subscription.base-url:http://localhost:8083/Subscription}")
    private String subscriptionBaseUrl;

    public boolean hasAiAccess(Long userId) {
        if (userId == null) {
            return false;
        }

        String url = subscriptionBaseUrl + "/user/" + userId + "/active";
        try {
            ActiveSubscriptionResponse resp = restTemplate.getForObject(url, ActiveSubscriptionResponse.class);
            if (resp == null) {
                return false;
            }

            if (!"ACTIVE".equalsIgnoreCase(resp.status)) {
                return false;
            }

            String type = resp.plan != null ? resp.plan.type : null;
            return type != null
                    && ("PREMIUM".equalsIgnoreCase(type) || "ENTERPRISE".equalsIgnoreCase(type));
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return false;
            }
            return false;
        } catch (RestClientException e) {
            return false;
        }
    }

    public record ActiveSubscriptionResponse(String status, SubscriptionPlan plan) {}

    public record SubscriptionPlan(String type) {}
}

