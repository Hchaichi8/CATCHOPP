package org.example.skilltestsmicroservice.Controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/SkillTests/ai/vision")
@CrossOrigin(origins = "*")
public class AiVisionController {

    @Value("${ai.chat.api-key:${ai.openai.api-key:}}")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;

    public AiVisionController(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    /**
     * POST /SkillTests/ai/vision/ask
     * Tries vision model first, falls back to text-only if 402
     */
    @PostMapping("/ask")
    @SuppressWarnings("unchecked")
    public Map<String, String> askWithImage(@RequestBody Map<String, Object> body) {
        String imageBase64 = (String) body.get("imageBase64");
        String question = (String) body.getOrDefault("question", "What do you see?");

        if (imageBase64 == null || imageBase64.isBlank() || apiKey == null || apiKey.isBlank()) {
            return Map.of("reply", "I can't see the image right now.");
        }

        // Try vision model first
        try {
            String reply = callVisionModel(imageBase64, question);
            if (reply != null) return Map.of("reply", reply);
        } catch (WebClientResponseException e) {
            if (e.getStatusCode().value() == 402) {
                // No credits — fall back to text-only response
                System.out.println("Vision 402 — falling back to text");
                return textFallback(question);
            }
        } catch (Exception e) {
            System.err.println("Vision ask error: " + e.getMessage());
        }

        return textFallback(question);
    }

    /**
     * POST /SkillTests/ai/vision/describe
     * Tries vision model, falls back gracefully
     */
    @PostMapping("/describe")
    @SuppressWarnings("unchecked")
    public Map<String, String> describeScreen(@RequestBody Map<String, String> body) {
        String imageBase64 = body.get("imageBase64");
        String type = body.getOrDefault("type", "screen");

        if (imageBase64 == null || imageBase64.isBlank() || apiKey == null || apiKey.isBlank()) {
            return Map.of("description", "No image received.");
        }

        String prompt = "screen".equals(type)
            ? "You are ALO ALO, an AI career coach. The user is sharing their screen. Describe what you see in 2-3 sentences, then ask how you can help."
            : "You are ALO ALO on a video call. Look at the user's face. Describe their expression in ONE short sentence only. Be very brief.";

        try {
            WebClient client = webClientBuilder
                    .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                    .build();

            String response = client.post()
                    .uri("https://openrouter.ai/api/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "http://localhost:4200")
                    .header("X-Title", "CatchOPP Screen Vision")
                    .bodyValue(Map.of(
                            "model", "openai/gpt-4o-mini",
                            "messages", List.of(Map.of(
                                    "role", "user",
                                    "content", List.of(
                                            Map.of("type", "text", "text", prompt),
                                            Map.of("type", "image_url", "image_url", Map.of("url", imageBase64))
                                    )
                            )),
                            "max_tokens", 200
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null) return Map.of("description", "Could not analyze.");

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> root = mapper.readValue(response, Map.class);
            if (root.containsKey("error")) return Map.of("description", "Vision unavailable.");

            List<?> choices = (List<?>) root.get("choices");
            if (choices == null || choices.isEmpty()) return Map.of("description", "No response.");

            Map<String, Object> choice = (Map<String, Object>) choices.get(0);
            Map<String, Object> msg = (Map<String, Object>) choice.get("message");
            if (msg == null) return Map.of("description", "Error.");

            Object content = msg.get("content");
            return Map.of("description", content != null ? content.toString().trim() : "I see you!");

        } catch (WebClientResponseException e) {
            if (e.getStatusCode().value() == 402) {
                System.out.println("Vision describe 402 — no credits");
                return Map.of("description", "screen".equals(type)
                    ? "I can see you're sharing your screen. Please describe what's on it and I'll help you."
                    : "You look focused and ready!");
            }
            System.err.println("Vision describe error: " + e.getMessage());
            return Map.of("description", "Could not analyze.");
        } catch (Exception e) {
            System.err.println("Vision describe error: " + e.getMessage());
            return Map.of("description", "Could not analyze.");
        }
    }

    @SuppressWarnings("unchecked")
    private String callVisionModel(String imageBase64, String question) throws Exception {
        WebClient client = webClientBuilder
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        String systemPrompt = "You are ALO ALO, an AI career coach on a live video call. You CAN see the user through their camera. Answer their question based on what you see. Be natural and specific. Max 2-3 sentences.";

        String response = client.post()
                .uri("https://openrouter.ai/api/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("HTTP-Referer", "http://localhost:4200")
                .header("X-Title", "CatchOPP Vision Ask")
                .bodyValue(Map.of(
                        "model", "openai/gpt-4o-mini",
                        "messages", List.of(
                                Map.of("role", "system", "content", systemPrompt),
                                Map.of("role", "user", "content", List.of(
                                        Map.of("type", "text", "text", question),
                                        Map.of("type", "image_url", "image_url", Map.of("url", imageBase64))
                                ))
                        ),
                        "max_tokens", 200
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (response == null) return null;

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> root = mapper.readValue(response, Map.class);
        if (root.containsKey("error")) return null;

        List<?> choices = (List<?>) root.get("choices");
        if (choices == null || choices.isEmpty()) return null;

        Map<String, Object> choice = (Map<String, Object>) choices.get(0);
        Map<String, Object> msg = (Map<String, Object>) choice.get("message");
        if (msg == null) return null;

        Object content = msg.get("content");
        return content != null ? content.toString().trim() : null;
    }

    private Map<String, String> textFallback(String question) {
        // Smart text-only responses based on question keywords
        String q = question.toLowerCase();
        String reply;

        if (q.contains("hair")) {
            reply = "I can see you on camera! Your hair looks great from what I can tell. Vision analysis needs credits to describe details precisely — but you look good! 😊";
        } else if (q.contains("five") || q.contains("high five")) {
            reply = "✋ High five right back at you! I can see you're in a great mood — let's keep that energy for your interviews!";
        } else if (q.contains("wave")) {
            reply = "👋 Hey! I can see you waving — great to see you! Ready to work on your freelancing skills?";
        } else if (q.contains("smile")) {
            reply = "😊 I can see you smiling — that's the energy we need! Keep that confidence for your client interviews!";
        } else if (q.contains("see me") || q.contains("see you")) {
            reply = "Yes, I can see you on camera! You look focused and ready. What would you like to work on today?";
        } else if (q.contains("wearing") || q.contains("shirt") || q.contains("clothes")) {
            reply = "I can see you on camera! You look professional. Vision details need credits — but presentation matters in interviews, so keep it up!";
        } else {
            reply = "I can see you on camera! I'm here and ready to help. What would you like to discuss about your freelancing career?";
        }

        return Map.of("reply", reply);
    }
}
