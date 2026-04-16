package org.example.technicalsupport.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TicketSummarizationService {

    @Value("${summarization.api.url:http://localhost:5000/summarize}")
    private String summarizationApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls the Python/Flask Hugging Face BART summarization service.
     * Falls back gracefully if the service is not running.
     */
    @SuppressWarnings("unchecked")
    public String summarize(String description) {
        if (description == null || description.isBlank()) return "";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = Map.of("text", description);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                summarizationApiUrl, HttpMethod.POST, entity, Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object summary = response.getBody().get("summary");
                if (summary != null) return summary.toString();
            }
        } catch (Exception e) {
            System.err.println("Summarization service unavailable: " + e.getMessage());
        }
        return ""; // fallback: no summary
    }
}
