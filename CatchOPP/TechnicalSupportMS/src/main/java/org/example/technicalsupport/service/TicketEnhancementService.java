package org.example.technicalsupport.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class TicketEnhancementService {

    @Value("${textrazor.api.key:}")
    private String apiKey;

    private static final String API_URL = "https://api.textrazor.com/";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Enhances a ticket description using TextRazor NLP analysis.
     * Extracts entities, topics, and sentiment to build an enriched description.
     * Falls back to original if API key not set or call fails.
     */
    @SuppressWarnings("unchecked")
    public String enhance(String title, String description) {
        if (description == null || description.isBlank()) return description;
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_TEXTRAZOR_API_KEY")) {
            return description; // graceful fallback
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-TextRazor-Key", apiKey);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("text", description);
            body.add("extractors", "entities,topics,sentences");
            body.add("cleanup.mode", "cleanHTML");

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(API_URL, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return buildEnhancedText(title, description, response.getBody());
            }
        } catch (Exception e) {
            System.err.println("TextRazor enhancement failed: " + e.getMessage());
        }
        return description;
    }

    @SuppressWarnings("unchecked")
    private String buildEnhancedText(String title, String original, Map<String, Object> apiResponse) {
        StringBuilder enhanced = new StringBuilder();
        enhanced.append(original.trim());

        try {
            Map<String, Object> response = (Map<String, Object>) apiResponse.get("response");
            if (response == null) return original;

            // Extract topics
            List<Map<String, Object>> topics = (List<Map<String, Object>>) response.get("topics");
            if (topics != null && !topics.isEmpty()) {
                enhanced.append("\n\n[Context: ");
                topics.stream()
                    .filter(t -> t.get("score") != null && ((Number) t.get("score")).doubleValue() > 0.7)
                    .limit(3)
                    .forEach(t -> enhanced.append(t.get("label")).append(", "));
                if (enhanced.toString().endsWith(", "))
                    enhanced.setLength(enhanced.length() - 2);
                enhanced.append("]");
            }

            // Extract key entities
            List<Map<String, Object>> entities = (List<Map<String, Object>>) response.get("entities");
            if (entities != null && !entities.isEmpty()) {
                enhanced.append("\n[Key terms: ");
                entities.stream()
                    .filter(e -> e.get("confidenceScore") != null && ((Number) e.get("confidenceScore")).doubleValue() > 0.8)
                    .limit(4)
                    .forEach(e -> enhanced.append(e.get("matchedText")).append(", "));
                if (enhanced.toString().endsWith(", "))
                    enhanced.setLength(enhanced.length() - 2);
                enhanced.append("]");
            }
        } catch (Exception e) {
            System.err.println("Error parsing TextRazor response: " + e.getMessage());
            return original;
        }

        return enhanced.toString();
    }
}
