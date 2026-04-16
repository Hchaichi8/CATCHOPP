package org.example.ms_competenceandreview.Services.Impl;

import com.fasterxml.jackson.core.JsonProcessingException;
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
        if (review.getDescription() != null && !review.getDescription().isBlank()) {

            // 🛡️ LAYER 1: Local keyword pre-filter (instant, no API call needed)
            if (containsBadWords(review.getDescription())) {
                throw new IllegalArgumentException("REJECTED: Your review contains inappropriate language.");
            }

        }

        if (review.getCreatedAt() == null) {
            review.setCreatedAt(java.time.LocalDateTime.now());
        }
        return reviewRepo.save(review);
    }


    private boolean containsBadWords(String text) {
        List<String> badWords = List.of(
                "spam", "scam", "fuck", "shit", "idiot", "stupid", "kill",
                "hate", "worthless", "garbage", "ass", "bastard", "crap"
                // Add more as needed
        );
        String lower = text.toLowerCase();
        return badWords.stream().anyMatch(lower::contains);
    }


    @Override
    public String generateEnhancedText(String originalText, Integer rating) {
        RestTemplate restTemplate = new RestTemplate();

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey;

        String ratingContext;
        if (rating >= 5) {
            ratingContext = "very satisfied client (5/5 stars)";
        } else if (rating == 4) {
            ratingContext = "satisfied client (4/5 stars)";
        } else if (rating == 3) {
            ratingContext = "neutral client (3/5 stars)";
        } else if (rating == 2) {
            ratingContext = "dissatisfied client (2/5 stars)";
        } else {
            ratingContext = "very dissatisfied client (1/5 stars)";
        }

        String prompt = "You are a review assistant for CatchIQ, a freelancing platform " +
                "that connects clients with skilled freelancers across domains such as " +
                "web development, design, marketing, data science, and more.\n\n" +
                "A " + ratingContext + " wrote this project review draft:\n" +
                "\"" + originalText + "\"\n\n" +
                "Your task:\n" +
                "- Rewrite it to sound like a natural, authentic project review\n" +
                "- Keep the same sentiment and opinion as the original\n" +
                "- Make it clear, professional, and helpful for other clients or freelancers\n" +
                "- Keep technical terms if the original mentions them (e.g. React, API, UI/UX, deadline, etc.)\n" +
                "- Write in the same language as the original (French or English)\n" +
                "- Do NOT add fake details the reviewer didn't mention\n" +
                "- Do NOT use overly marketing or exaggerated language\n" +
                "- Return ONLY the rewritten review text, nothing else\n" +
                "- Keep it between 2-4 sentences maximum";

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
            return originalText; // Fallback to original on API error
        } catch (Exception e) {
            System.err.println("Unexpected Error: " + e.getMessage());
            return originalText; // Fallback to original on any error
        }
    }

    @Override
    public List<Review> GetReviewsByProject(Long projectId) {
        List<Review> reviews = reviewRepo.findByProjectId(projectId);

        for (Review review : reviews) {
            try {
                // 🟢 FIX: Use freelancerId for FREELANCER reviews, clientId for CLIENT reviews
                String idToResolve = "FREELANCER".equalsIgnoreCase(review.getReviewerRole())
                        ? review.getFreelancerId()
                        : review.getClientId();

                if (idToResolve != null) {
                    Long userId = Long.parseLong(idToResolve);
                    UserDTO user = userClient.getUserById(userId);

                    if (user != null) {
                        String fullName = (user.getFirstName() != null ? user.getFirstName() : "")
                                + " "
                                + (user.getLastName() != null ? user.getLastName() : "");
                        review.setReviewerName(fullName.trim());
                    }
                }
            } catch (Exception e) {
                System.err.println("Feign error for review " + review.getId() + ": " + e.getMessage());
                review.setReviewerName("Unknown User");
            }
        }
        return reviews;
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


    @Autowired
    private UserClient userClient;


}
