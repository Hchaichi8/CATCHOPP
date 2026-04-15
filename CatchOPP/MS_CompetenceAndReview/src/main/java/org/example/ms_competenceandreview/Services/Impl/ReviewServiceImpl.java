package org.example.ms_competenceandreview.Services.Impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.ms_competenceandreview.DTO.UserDTO;
import org.example.ms_competenceandreview.Entities.Review;
import org.example.ms_competenceandreview.Repositories.ReviewRepo;
import org.example.ms_competenceandreview.Services.Interface.ReviewService;
import org.example.ms_competenceandreview.Feign.UserClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.*;


@Service
public class ReviewServiceImpl implements ReviewService {
    @Autowired
    ReviewRepo reviewRepo;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Override
    public Review AjouterReview(Review review) {
        return reviewRepo.save(review);
    }
    @Override
    public List<Review> GetReviewsByFreelancer(String freelancerId) {
        return reviewRepo.findByFreelancerId(freelancerId);
    }

    @Override
    public List<Review> GetReviewsByClient(String clientId) {
        return reviewRepo.findByClientId(clientId);
    }

    @Override
    public Review ModifierReview(Review review) {
        return reviewRepo.save(review);
    }

    @Override
    public void SupprimerReview(Long id) {
        reviewRepo.deleteById(id);

    }

    @Override
    public Review GetReview(Long id) {
        return reviewRepo.findById(id).orElseThrow();
    }

    @Override
    public List<Review> GetAllReview() {
        return reviewRepo.findAll();
    }

    @Override
    public String generateEnhancedText(String originalText, Integer rating) {
        RestTemplate restTemplate = new RestTemplate();

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;

        String prompt = "Professionalize this freelancer review. " +
                "Rating: " + rating + "/5 stars. " +
                "Original draft: '" + originalText + "'. " +
                "Instructions: Rewrite it to be polite, clear, and professional. Return ONLY the rewritten text.";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", Collections.singletonList(textPart));

        Map<String, Object> contents = new HashMap<>();
        contents.put("contents", Collections.singletonList(parts));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            List candidates = (List) response.getBody().get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List partsList = (List) content.get("parts");
            Map firstPart = (Map) partsList.get(0);

            return (String) firstPart.get("text");

        } catch (HttpClientErrorException e) {
            System.err.println("API Error: " + e.getResponseBodyAsString());
            return "Google API Error: " + e.getStatusCode() + " - Check your backend console for details.";
        } catch (Exception e) {
            System.err.println("Unexpected Error: " + e.getMessage());
            return "Unexpected System Error: " + e.getMessage();
        }
    }

    @Autowired
    private UserClient userClient;

    @Override
    public List<Review> GetReviewsByProject(Long projectId) {
        List<Review> reviews = reviewRepo.findByProjectId(projectId);

        for (Review review : reviews) {
            try {
                if (review.getClientId() != null) {
                    Long userId = Long.parseLong(review.getClientId());

                    // 🟢 Clean call: Feign + JacksonDecoder handles the rest
                    UserDTO user = userClient.getUserById(userId);

                    if (user != null) {
                        String fullName = (user.getFirstName() != null ? user.getFirstName() : "")
                                + " "
                                + (user.getLastName() != null ? user.getLastName() : "");
                        review.setReviewerName(fullName.trim());
                    }
                }
            } catch (Exception e) {
                // This will catch 404s or connection issues
                System.err.println("Feign error for ID " + review.getClientId() + ": " + e.getMessage());
                review.setReviewerName("Unknown User");
            }
        }
        return reviews;
    }
}
