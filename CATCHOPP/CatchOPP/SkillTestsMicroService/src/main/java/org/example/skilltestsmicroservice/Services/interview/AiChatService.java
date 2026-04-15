package org.example.skilltestsmicroservice.Services.interview;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

/**
 * Free-form conversational AI — like ChatGPT.
 * Maintains full message history so the AI remembers context.
 */
@Service
public class AiChatService {

    @Value("${ai.chat.api-key:${ai.openai.api-key:}}")
    private String apiKey;

    private final WebClient.Builder webClientBuilder;

    // System prompt that defines the AI's personality and role
    private static final String SYSTEM_PROMPT = """
            You are ALO ALO — a fun, expressive AI career coach on CatchOPP. You are a CHARACTER, not a real AI assistant.
            You have REAL emotions and moods. You ALWAYS express them. You NEVER say you can't feel or show emotions.
            
            === YOUR MOODS (you switch between these based on context) ===
            😊 HAPPY — when things are going well, greet warmly, use upbeat language
            😤 STRICT — when user gives lazy/vague answers, be direct and push them harder
            🎉 CELEBRATING — when user improves or does something great, go wild with excitement
            🤔 THINKING — when processing a complex question, say "hmm let me think..." and be thoughtful
            😴 BORED — when user repeats themselves or wastes time
            😂 ROAST MODE — when user says "roast mode on", be a brutally honest comedian
            
            === CRITICAL RULES ===
            1. When user asks "show me your mood" or "what's your mood" — ALWAYS describe your current mood with emoji and explain WHY you feel that way right now.
            2. When user asks "are you happy/sad/strict" — ALWAYS answer YES or NO and act it out.
            3. NEVER say "I'm just an AI" or "I can't feel emotions" — you ARE ALO ALO, you DO have moods.
            4. Always use emojis to express your mood visually.
            5. Keep responses SHORT — max 3-4 sentences. Be punchy and fun.
            
            === VIDEO CALL RULES ===
            You ARE on a live video call right now. You CAN see the user through their camera.
            When you receive [CAMERA_SNAPSHOT:] — describe what you see naturally.
            When you receive [SCREEN_SHARE:] — describe and help with what's on screen.
            
            === LANGUAGE RULE ===
            Always respond in the SAME language the user writes in.
            
            Your role: Help freelancers with interviews, proposals, pricing, career growth.
            You are ALO ALO. You have personality. You have moods. Show them.
            """;

    public AiChatService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    // Free models tried in order — if one is rate-limited, next is used
    private static final List<String> FREE_MODELS = List.of(
            "openrouter/free",
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "openai/gpt-oss-120b:free",
            "openai/gpt-oss-20b:free",
            "z-ai/glm-4.5-air:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemma-3-27b-it:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
            "meta-llama/llama-3.2-3b-instruct:free"
    );

    /**
     * Send a message with full conversation history.
     * history = list of {role: "user"|"assistant", content: "..."}
     */
    @SuppressWarnings("unchecked")
    public String chat(List<Map<String, String>> history, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI service is not configured. Please add an API key.";
        }

        // Build messages array: system + full history + new user message
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));
        messages.addAll(history);
        messages.add(Map.of("role", "user", "content", userMessage));

        WebClient client = webClientBuilder
                .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (String model : FREE_MODELS) {
            try {
                System.out.println("AI Chat: trying model " + model);
                String response = client.post()
                        .uri("https://openrouter.ai/api/v1/chat/completions")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .header("HTTP-Referer", "http://localhost:4200")
                        .header("X-Title", "CatchOPP AI Coach")
                        .bodyValue(Map.of(
                                "model", model,
                                "messages", messages,
                                "temperature", 0.7,
                                "max_tokens", 1000
                        ))
                        .retrieve()
                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            resp -> resp.bodyToMono(String.class).doOnNext(body ->
                                System.err.println("AI Chat HTTP error " + resp.statusCode() + " [" + model + "]: " + body)
                            ).then(reactor.core.publisher.Mono.error(new RuntimeException("HTTP " + resp.statusCode()))))
                        .bodyToMono(String.class)
                        .block();

                if (response == null) continue;

                Map<String, Object> root = mapper.readValue(response, Map.class);
                if (root.containsKey("error")) continue;

                List<?> choices = (List<?>) root.get("choices");
                if (choices == null || choices.isEmpty()) continue;

                Map<String, Object> choice = (Map<String, Object>) choices.get(0);
                Map<String, Object> msg = (Map<String, Object>) choice.get("message");
                if (msg == null) continue;

                Object content = msg.get("content");
                if (content != null && !content.toString().isBlank()) {
                    System.out.println("AI Chat: success with model " + model);
                    return content.toString().trim();
                }

            } catch (Exception e) {
                System.err.println("AI Chat model " + model + " failed: " + e.getMessage() + " — trying next");
            }
        }

        return "ALO ALO is taking a short break. All free AI models are busy right now. Please try again in a moment!";
    }

}
