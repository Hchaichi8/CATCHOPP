package org.example.skilltestsmicroservice.Services;

import org.example.skilltestsmicroservice.DTO.QuestionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class AiQuestionGeneratorService {

    @Value("${ai.provider:openai}")
    private String aiProvider;

    @Value("${ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    private final WebClient.Builder webClientBuilder;
    private final KnowledgeBaseService knowledgeBase;
    private final Random random = new Random();

    @Autowired
    public AiQuestionGeneratorService(WebClient.Builder webClientBuilder, KnowledgeBaseService knowledgeBase) {
        this.webClientBuilder = webClientBuilder;
        this.knowledgeBase = knowledgeBase;
    }

    // Template-based questions (fallback when no API key)
    private static final Map<String, List<QuestionDTO>> TEMPLATE_QUESTIONS = Map.of(
            "Web Development", List.of(
                    createQ("What does NgModule do in Angular?", "Defines a compilation context", "Renders HTML", "Handles HTTP", "Manages state", "A"),
                    createQ("Which decorator defines a component?", "@Component", "@Module", "@Service", "@Directive", "A"),
                    createQ("What is RxJS used for?", "Reactive programming", "Routing", "Forms", "Testing", "A"),
                    createQ("What is the virtual DOM?", "A lightweight copy of the real DOM", "A type of database", "A routing mechanism", "A testing framework", "A"),
                    createQ("What does REST stand for?", "Representational State Transfer", "Reliable State Transfer", "Remote State Transfer", "Representational Service Transfer", "A"),
                    createQ("Which HTTP method is used for creating resources?", "POST", "GET", "PUT", "DELETE", "A"),
                    createQ("What is TypeScript?", "A typed superset of JavaScript", "A new programming language", "A database", "A framework", "A")
            ),
            "Design", List.of(
                    createQ("What does UX stand for?", "User Experience", "User Export", "Unified Experience", "User Extension", "A"),
                    createQ("Which tool is commonly used for prototyping?", "Figma", "Excel", "Word", "Photoshop", "A"),
                    createQ("What is the purpose of a wireframe?", "Layout and structure of a page", "Final visual design", "Color palette", "Animation timing", "A"),
                    createQ("What does 'above the fold' mean?", "Content visible without scrolling", "Header section", "Navigation menu", "Footer content", "A"),
                    createQ("What is accessibility in design?", "Design usable by people with disabilities", "Design for mobile only", "Design for developers", "Design for print", "A"),
                    createQ("What is a design system?", "A collection of reusable components and standards", "A single template", "A color palette only", "A font library", "A")
            ),
            "Marketing", List.of(
                    createQ("What is SEO?", "Search Engine Optimization", "Social Engagement Optimization", "System Error Override", "Standard Entry Option", "A"),
                    createQ("What does CTR stand for?", "Click-Through Rate", "Cost To Revenue", "Content Type Ratio", "Customer Trust Rating", "A"),
                    createQ("What is a funnel in marketing?", "The path from awareness to conversion", "A type of email", "A social media tool", "A budget model", "A"),
                    createQ("What is A/B testing?", "Comparing two versions to see which performs better", "Testing accessibility", "Backup testing", "API testing", "A"),
                    createQ("What does KPI stand for?", "Key Performance Indicator", "Key Process Input", "Knowledge Panel Index", "Keyword Performance Index", "A")
            ),
            "Data Science", List.of(
                    createQ("What is overfitting in ML?", "Model performs well on training but poorly on new data", "Too many features", "Underfitting", "Data leakage", "A"),
                    createQ("What does EDA stand for?", "Exploratory Data Analysis", "External Data Access", "Event Driven Architecture", "Error Detection Algorithm", "A"),
                    createQ("What is a confusion matrix?", "Table showing true vs predicted classifications", "A type of neural network", "A clustering method", "A regression metric", "A"),
                    createQ("What is cross-validation?", "Splitting data to evaluate model performance", "Data validation", "Feature scaling", "Model deployment", "A"),
                    createQ("What does API stand for in data?", "Application Programming Interface", "Automated Process Integration", "Advanced Predictive Index", "Analytic Performance Indicator", "A")
            ),
            "Mobile Development", List.of(
                    createQ("What is React Native?", "Framework for building mobile apps with React", "A React library for web", "A database", "A testing tool", "A"),
                    createQ("What is Flutter?", "Google's UI toolkit for cross-platform apps", "A web framework", "A database", "A cloud service", "A"),
                    createQ("What does APK stand for?", "Android Package Kit", "App Performance Kit", "Application Process Kernel", "Automated Program Key", "A"),
                    createQ("What is an emulator?", "Software that mimics mobile device hardware", "A type of app", "A testing framework", "A deployment tool", "A"),
                    createQ("What is a native app?", "App built for a specific platform", "Web app", "Hybrid app", "Progressive web app", "A")
            )
    );

    private static QuestionDTO createQ(String q, String a, String b, String c, String d, String correct) {
        QuestionDTO dto = new QuestionDTO();
        dto.setQuestionText(q);
        dto.setOptionA(a);
        dto.setOptionB(b);
        dto.setOptionC(c);
        dto.setOptionD(d);
        dto.setCorrectOption(correct);
        return dto;
    }

    public List<QuestionDTO> generateQuestions(String category, int count) {
        String knowledge = knowledgeBase.getKnowledgeForCategory(category);
        String provider = (aiProvider != null) ? aiProvider.toLowerCase() : "openai";

        if ("gemini".equals(provider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                return generateWithGemini(category, count, knowledge);
            } catch (Exception e) {
                // Fallback
            }
        }
        if ("openai".equals(provider) && openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                return generateWithOpenAI(category, count, knowledge);
            } catch (Exception e) {
                // Fallback
            }
        }
        return generateFromTemplates(category, count);
    }

    private String buildPromptWithKnowledge(String category, int count, String knowledge) {
        StringBuilder prompt = new StringBuilder();
        if (knowledge != null && !knowledge.isBlank()) {
            prompt.append("Use the following knowledge as the primary source for your questions:\n\n");
            prompt.append(knowledge);
            prompt.append("\n\nBased on this content, ");
        } else {
            prompt.append("Using your expertise, ");
        }
        prompt.append(String.format(
                "generate exactly %d multiple choice questions for the category: %s. " +
                "Each question must have exactly 4 options (A, B, C, D). " +
                "Return ONLY a valid JSON array of objects with these fields: questionText, optionA, optionB, optionC, optionD, correctOption (A, B, C or D). " +
                "No markdown, no code blocks, no explanation - only the JSON array.",
                count, category));
        return prompt.toString();
    }

    @SuppressWarnings("unchecked")
    private List<QuestionDTO> generateWithOpenAI(String category, int count, String knowledge) {
        String prompt = buildPromptWithKnowledge(category, count, knowledge);

        WebClient client = webClientBuilder.build();
        String response = client.post()
                .uri("https://api.openai.com/v1/chat/completions")
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(Map.of(
                        "model", "gpt-3.5-turbo",
                        "messages", List.of(Map.of("role", "user", "content", prompt)),
                        "temperature", 0.7
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (response == null) throw new RuntimeException("OpenAI returned null");

        String content = extractOpenAIContent(response);
        if (content == null) throw new RuntimeException("Could not parse OpenAI response");

        return parseQuestionsFromJson(content, count);
    }

    private String extractOpenAIContent(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> root = mapper.readValue(json, Map.class);
            List<?> choices = (List<?>) root.get("choices");
            if (choices == null || choices.isEmpty()) return null;
            Map<String, Object> choice = (Map<String, Object>) choices.get(0);
            Map<String, Object> msg = (Map<String, Object>) choice.get("message");
            if (msg == null) return null;
            Object content = msg.get("content");
            return content != null ? content.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private List<QuestionDTO> generateWithGemini(String category, int count, String knowledge) {
        String prompt = buildPromptWithKnowledge(category, count, knowledge);

        WebClient client = webClientBuilder.build();
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 2048,
                        "responseMimeType", "application/json"
                )
        );

        String response = client.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (response == null) throw new RuntimeException("Gemini returned null");

        // Check for API error (e.g. invalid key, model not found)
        if (response.contains("\"error\"")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> err = mapper.readValue(response, Map.class);
                Map<String, Object> error = (Map<String, Object>) err.get("error");
                if (error != null) {
                    String msg = (String) error.get("message");
                    throw new RuntimeException("Gemini API error: " + (msg != null ? msg : response));
                }
            } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
                throw new RuntimeException("Gemini API error: " + response);
            }
        }

        String content = extractGeminiContent(response);
        if (content == null) throw new RuntimeException("Could not parse Gemini response");

        return parseQuestionsFromJson(content, count);
    }

    private String extractGeminiContent(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> root = mapper.readValue(json, Map.class);
            List<?> candidates = (List<?>) root.get("candidates");
            if (candidates == null || candidates.isEmpty()) return null;
            Map<String, Object> candidate = (Map<String, Object>) candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            if (content == null) return null;
            List<?> parts = (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) return null;
            Map<String, Object> part = (Map<String, Object>) parts.get(0);
            Object text = part.get("text");
            return text != null ? text.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private List<QuestionDTO> generateFromTemplates(String category, int count) {
        List<QuestionDTO> pool = TEMPLATE_QUESTIONS.getOrDefault(category, TEMPLATE_QUESTIONS.get("Web Development"));
        if (pool.size() <= count) return new ArrayList<>(pool);

        List<QuestionDTO> result = new ArrayList<>();
        List<Integer> used = new ArrayList<>();
        while (result.size() < count) {
            int idx = random.nextInt(pool.size());
            if (!used.contains(idx)) {
                used.add(idx);
                result.add(pool.get(idx));
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<QuestionDTO> parseQuestionsFromJson(String content, int maxCount) {
        List<QuestionDTO> result = new ArrayList<>();
        try {
            // Clean JSON - remove markdown code blocks if present
            String cleaned = content.trim();
            if (cleaned.startsWith("```")) {
                int start = cleaned.indexOf("\n") + 1;
                int end = cleaned.lastIndexOf("```");
                if (end > start) cleaned = cleaned.substring(start, end);
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, Object>> arr = mapper.readValue(cleaned, List.class);
            for (Object o : arr) {
                if (result.size() >= maxCount) break;
                Map<String, Object> m = (Map<String, Object>) o;
                QuestionDTO q = new QuestionDTO();
                q.setQuestionText((String) m.get("questionText"));
                q.setOptionA((String) m.get("optionA"));
                q.setOptionB((String) m.get("optionB"));
                q.setOptionC((String) m.get("optionC"));
                q.setOptionD((String) m.get("optionD"));
                String co = String.valueOf(m.get("correctOption")).toUpperCase();
                q.setCorrectOption(co.isEmpty() ? "A" : co.substring(0, 1));
                result.add(q);
            }
        } catch (Exception e) {
            return generateFromTemplates("Web Development", maxCount);
        }
        return result.isEmpty() ? generateFromTemplates("Web Development", maxCount) : result;
    }

    public List<String> getAvailableCategories() {
        return new ArrayList<>(TEMPLATE_QUESTIONS.keySet());
    }
}
