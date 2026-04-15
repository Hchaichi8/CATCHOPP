package org.example.skilltestsmicroservice.Services.interview;

import org.example.skilltestsmicroservice.DTO.interview.StartInterviewRequest;
import org.example.skilltestsmicroservice.Entities.interview.InterviewSession;
import org.example.skilltestsmicroservice.Entities.interview.InterviewTurn;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiInterviewService {

    private static final int DEFAULT_QUESTION_COUNT = 5;
    private static final Pattern SCORE_PATTERN = Pattern.compile("SCORE\\s*:\\s*(\\d{1,3})", Pattern.CASE_INSENSITIVE);

    @Value("${ai.provider:openai}")
    private String aiProvider;

    @Value("${ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    private final WebClient.Builder webClientBuilder;

    public AiInterviewService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public InterviewStartContent buildStartContent(StartInterviewRequest request) {
        String role = normalizedRole(request.getRole());
        String projectTitle = safe(request.getProjectTitle(), "Untitled Project");
        String skills = joinSkills(request.getSkills());

        String fallbackIntro = "Welcome to your AI interview simulator. I am acting as the client for \"" + projectTitle + "\"."
                + " I will ask " + DEFAULT_QUESTION_COUNT + " focused questions for a " + role + " profile.";
        String fallbackQuestion = fallbackQuestion(0, role, skills, projectTitle);

        String prompt = """
                You are simulating a professional freelance client interview.
                Create exactly two short lines:
                INTRO: <one welcoming intro sentence>
                QUESTION: <first interview question>

                Context:
                - Project title: %s
                - Role: %s
                - Target skills: %s
                - Tone: practical, real-world, client-oriented
                """.formatted(projectTitle, role, skills);

        String content = callAi(prompt);
        if (content == null || content.isBlank()) {
            return new InterviewStartContent(fallbackIntro, fallbackQuestion);
        }
        String intro = extractPrefixed(content, "INTRO:");
        String question = extractPrefixed(content, "QUESTION:");
        if (intro == null || question == null) {
            return new InterviewStartContent(fallbackIntro, fallbackQuestion);
        }
        return new InterviewStartContent(intro, question);
    }

    public String buildNextQuestion(InterviewSession session, List<InterviewTurn> turns) {
        int nextIndex = turns.size();
        String skills = safe(session.getTargetSkills(), "general freelance skills");
        String context = turns.stream()
                .map(t -> "Q: " + safe(t.getAiQuestion(), "") + "\nA: " + safe(t.getUserAnswer(), ""))
                .collect(Collectors.joining("\n\n"));

        String prompt = """
                You are continuing a professional client interview simulation.
                Ask ONLY one next interview question.
                Keep it concise, practical, and adapted to previous answers.

                Project: %s
                Role: %s
                Skills: %s
                Question number now: %d out of %d

                Previous turns:
                %s
                """.formatted(
                safe(session.getProjectTitle(), "Untitled Project"),
                normalizedRole(session.getRole()),
                skills,
                nextIndex + 1,
                session.getTotalQuestions() != null ? session.getTotalQuestions() : DEFAULT_QUESTION_COUNT,
                context
        );

        String content = callAi(prompt);
        if (content == null || content.isBlank()) {
            return fallbackQuestion(nextIndex, normalizedRole(session.getRole()), skills, safe(session.getProjectTitle(), "project"));
        }
        return content.trim();
    }

    public InterviewFeedbackNextQuestion buildFeedbackAndNextQuestion(InterviewSession session, List<InterviewTurn> turns) {
        int answeredCount = turns.size();
        int nextIndex = answeredCount;

        String skills = safe(session.getTargetSkills(), "general freelance skills");
        String context = turns.stream()
                .map(t -> "Q: " + safe(t.getAiQuestion(), "") + "\nA: " + safe(t.getUserAnswer(), ""))
                .collect(Collectors.joining("\n\n"));

        String fallbackNextQuestion = fallbackQuestion(
                nextIndex,
                normalizedRole(session.getRole()),
                skills,
                safe(session.getProjectTitle(), "project")
        );

        String fallbackFeedback = "Thanks for your answer. Improve clarity by stating your concrete steps first, "
                + "then your reasoning, risks, and timeline. End with one measurable outcome you would deliver for this project.";

        String prompt = """
                You are continuing a professional freelance client interview simulation.

                Requirements (output MUST follow this format):
                FEEDBACK: <correct and advise based on the freelancer's previous answer>
                NEXT_QUESTION: <ask ONLY one next interview question>

                Rules:
                - Be direct and helpful like a real client.
                - Identify 1-2 improvements (structure, missing details, risks, communication, plan).
                - Keep feedback concise (2-4 sentences) and practical.
                - NEXT_QUESTION must be tailored to the previous answer.
                - Do not include any extra text outside the two lines.

                Project: %s
                Role: %s
                Skills: %s
                Progress: answered %d out of %d

                Previous turns:
                %s
                """.formatted(
                safe(session.getProjectTitle(), "Untitled Project"),
                normalizedRole(session.getRole()),
                skills,
                answeredCount,
                session.getTotalQuestions() != null ? session.getTotalQuestions() : DEFAULT_QUESTION_COUNT,
                context
        );

        String content = callAi(prompt);
        if (content == null || content.isBlank()) {
            return new InterviewFeedbackNextQuestion(fallbackFeedback, fallbackNextQuestion);
        }

        String feedback = extractPrefixed(content, "FEEDBACK:");
        String nextQuestion = extractPrefixed(content, "NEXT_QUESTION:");

        if (feedback == null || nextQuestion == null || nextQuestion.isBlank()) {
            // If the AI returned unexpected format, fall back safely.
            return new InterviewFeedbackNextQuestion(fallbackFeedback, fallbackNextQuestion);
        }

        return new InterviewFeedbackNextQuestion(feedback.trim(), nextQuestion.trim());
    }

    public InterviewEvaluation evaluateSession(InterviewSession session, List<InterviewTurn> turns) {
        String turnsText = turns.stream()
                .map(t -> "Q: " + safe(t.getAiQuestion(), "") + "\nA: " + safe(t.getUserAnswer(), ""))
                .collect(Collectors.joining("\n\n"));

        String prompt = """
                You are evaluating a completed freelance interview simulation.
                Return exactly:
                SCORE: <0-100 integer>
                FEEDBACK: <one concise paragraph with strengths and improvements>

                Context:
                - Project: %s
                - Role: %s
                - Skills: %s

                Interview transcript:
                %s
                """.formatted(
                safe(session.getProjectTitle(), "Untitled Project"),
                normalizedRole(session.getRole()),
                safe(session.getTargetSkills(), "general freelance skills"),
                turnsText
        );

        String content = callAi(prompt);
        if (content == null || content.isBlank()) {
            return fallbackEvaluation(turns);
        }

        Matcher m = SCORE_PATTERN.matcher(content);
        Integer score = null;
        if (m.find()) {
            try {
                score = Math.max(0, Math.min(100, Integer.parseInt(m.group(1))));
            } catch (NumberFormatException ignored) {
                score = null;
            }
        }
        String feedback = extractPrefixed(content, "FEEDBACK:");
        if (score == null || feedback == null || feedback.isBlank()) {
            return fallbackEvaluation(turns);
        }
        return new InterviewEvaluation(score, feedback.trim());
    }

    private InterviewEvaluation fallbackEvaluation(List<InterviewTurn> turns) {
        long detailedAnswers = turns.stream()
                .map(InterviewTurn::getUserAnswer)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> s.length() >= 80)  // require meaningful answers
                .count();
        // Only give score if answers are actually detailed
        int score = (int) Math.min(100, detailedAnswers * 15);
        String feedback = score < 30
                ? "Your answers were too short or lacked substance. Provide detailed, structured responses with concrete examples."
                : "Good effort. Your answers cover the essentials, but you can improve by being more specific "
                + "about delivery steps, risks, and client communication. Add concrete examples and measurable outcomes.";
        return new InterviewEvaluation(score, feedback);
    }

    private String callAi(String prompt) {
        String provider = aiProvider == null ? "openrouter" : aiProvider.toLowerCase();
        try {
            if ("gemini".equals(provider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
                return callGemini(prompt);
            }
            // openrouter and openai both use the same endpoint style
            if (("openai".equals(provider) || "openrouter".equals(provider))
                    && openaiApiKey != null && !openaiApiKey.isBlank()) {
                return callOpenRouter(prompt);
            }
        } catch (Exception ignored) {
            // Fallback handled by caller.
        }
        return null;
    }

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

    @SuppressWarnings("unchecked")
    private String callOpenRouter(String prompt) throws Exception {
        WebClient client = webClientBuilder.build();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (String model : FREE_MODELS) {
            try {
                System.out.println("AI Interview: trying model " + model);
                String response = client.post()
                        .uri("https://openrouter.ai/api/v1/chat/completions")
                        .header("Authorization", "Bearer " + openaiApiKey)
                        .header("Content-Type", "application/json")
                        .header("HTTP-Referer", "http://localhost:4200")
                        .header("X-Title", "CatchOPP AI Interview")
                        .bodyValue(Map.of(
                                "model", model,
                                "messages", List.of(Map.of("role", "user", "content", prompt)),
                                "temperature", 0.4,
                                "max_tokens", 900
                        ))
                        .retrieve()
                        .onStatus(status -> status.value() == 429 || status.is5xxServerError(),
                            resp -> resp.bodyToMono(String.class).doOnNext(body ->
                                System.err.println("AI Interview HTTP " + resp.statusCode() + " [" + model + "]: " + body)
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
                    System.out.println("AI Interview: success with model " + model);
                    return content.toString();
                }
            } catch (Exception e) {
                System.err.println("AI Interview model " + model + " failed: " + e.getMessage() + " — trying next");
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String callOpenAi(String prompt) throws Exception {
        WebClient client = webClientBuilder.build();
        String response = client.post()
                .uri("https://api.openai.com/v1/chat/completions")
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(Map.of(
                        "model", "gpt-3.5-turbo",
                        "messages", List.of(Map.of("role", "user", "content", prompt)),
                        "temperature", 0.4
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        if (response == null) {
            return null;
        }
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> root = mapper.readValue(response, Map.class);
        List<?> choices = (List<?>) root.get("choices");
        if (choices == null || choices.isEmpty()) {
            return null;
        }
        Map<String, Object> choice = (Map<String, Object>) choices.get(0);
        Map<String, Object> msg = (Map<String, Object>) choice.get("message");
        if (msg == null) {
            return null;
        }
        Object content = msg.get("content");
        return content != null ? content.toString() : null;
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) throws Exception {
        WebClient client = webClientBuilder.build();
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        String response = client.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .bodyValue(Map.of(
                        "contents", List.of(Map.of(
                                "parts", List.of(Map.of("text", prompt))
                        )),
                        "generationConfig", Map.of("temperature", 0.4, "maxOutputTokens", 900)
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        if (response == null || response.contains("\"error\"")) {
            return null;
        }

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> root = mapper.readValue(response, Map.class);
        List<?> candidates = (List<?>) root.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }
        Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
        if (content == null) {
            return null;
        }
        List<?> parts = (List<?>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            return null;
        }
        Map<String, Object> part = (Map<String, Object>) parts.get(0);
        Object text = part.get("text");
        return text != null ? text.toString() : null;
    }

    private static String extractPrefixed(String content, String prefix) {
        return Arrays.stream(content.split("\\R"))
                .map(String::trim)
                .filter(line -> line.toUpperCase().startsWith(prefix.toUpperCase()))
                .map(line -> line.substring(prefix.length()).trim())
                .filter(s -> !s.isBlank())
                .findFirst()
                .orElse(null);
    }

    private static String joinSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return "communication, planning, technical execution";
        }
        return skills.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));
    }

    private static String normalizedRole(String role) {
        return safe(role, "Freelancer");
    }

    private static String safe(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private static String fallbackQuestion(int index, String role, String skills, String projectTitle) {
        List<String> pool = List.of(
                "How would you break down this project into milestones and estimate delivery time realistically?",
                "Which risks do you see first in this project, and how would you reduce them early?",
                "How would you communicate progress and handle scope changes with a client?",
                "Which part of your " + role + " experience best matches this project, and why?",
                "Given the required skills (" + skills + "), what implementation approach would you choose first?"
        );
        return pool.get(Math.floorMod(index, pool.size())) + " (Project: " + projectTitle + ")";
    }

    public record InterviewStartContent(String intro, String firstQuestion) {}
    public record InterviewEvaluation(Integer score, String feedback) {}

    public record InterviewFeedbackNextQuestion(String feedback, String nextQuestion) {}
}
