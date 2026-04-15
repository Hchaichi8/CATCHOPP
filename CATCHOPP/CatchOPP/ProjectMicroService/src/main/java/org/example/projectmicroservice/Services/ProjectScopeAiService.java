package org.example.projectmicroservice.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.projectmicroservice.Dto.ProjectScopeAnalysisDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ProjectScopeAiService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${ai.openai.api-key:}")
    private String apiKey;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public ProjectScopeAnalysisDto analyze(String title, String description) {
        String t = title == null ? "" : title.trim();
        String d = description == null ? "" : description.trim();
        if (t.isEmpty() && d.isEmpty()) {
            return heuristicAnalyze(t, d);
        }
        if (apiKey == null || apiKey.isBlank()) {
            return heuristicAnalyze(t, d);
        }
        try {
            return callLlm(t, d);
        } catch (Exception e) {
            ProjectScopeAnalysisDto fallback = heuristicAnalyze(t, d);
            fallback.getSuggestions().add(0, "AI analysis unavailable; showing basic checks only.");
            return fallback;
        }
    }

    private ProjectScopeAnalysisDto callLlm(String title, String description) throws Exception {
        boolean openRouter = apiKey.startsWith("sk-or-v1-");
        String url = openRouter
                ? "https://openrouter.ai/api/v1/chat/completions"
                : "https://api.openai.com/v1/chat/completions";
        String model = openRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

        String system = """
                You are a senior product manager reviewing freelance project postings.
                Analyze TITLE and DESCRIPTION for clarity, scope, and realism.
                Respond with ONLY valid JSON (no markdown) with exactly these keys:
                "quality": one of "good", "needs_detail", "vague", "unrealistic"
                "missing": array of short strings naming gaps (e.g. "timeline", "budget", "technical requirements", "deliverables", "success criteria")
                "unrealistic_notes": array of strings if scope sounds impossible or contradictory; else []
                "suggestions": 3-6 concrete improvement bullets for the client
                "ready_to_post": boolean — true only if description is specific enough for a freelancer to estimate work
                "headline": one short sentence like "Your project description is missing: timeline, budget, technical requirements"
                Be strict but fair. If text is very short, mark vague and not ready.
                """;

        String userContent = "TITLE:\n" + title + "\n\nDESCRIPTION:\n" + description;

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.25,
                "max_tokens", 700,
                "messages", List.of(
                        Map.of("role", "system", "content", system),
                        Map.of("role", "user", "content", userContent)
                ),
                "response_format", Map.of("type", "json_object")
        );

        String json = MAPPER.writeValueAsString(body);

        HttpRequest.Builder rb = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8));
        if (openRouter) {
            rb.header("HTTP-Referer", "http://localhost:4200")
                    .header("X-Title", "CatchOPP Project Scope");
        }

        HttpResponse<String> resp = http.send(rb.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new IllegalStateException("LLM HTTP " + resp.statusCode());
        }

        JsonNode root = MAPPER.readTree(resp.body());
        if (root.has("error")) {
            throw new IllegalStateException(root.path("error").path("message").asText("LLM error"));
        }
        String content = root.path("choices").path(0).path("message").path("content").asText();
        JsonNode parsed = MAPPER.readTree(extractJson(content));

        List<String> missing = toStringList(parsed.path("missing"));
        List<String> unreal = toStringList(parsed.path("unrealistic_notes"));
        List<String> sugg = toStringList(parsed.path("suggestions"));

        return ProjectScopeAnalysisDto.builder()
                .quality(parsed.path("quality").asText("needs_detail"))
                .missing(missing)
                .unrealisticNotes(unreal)
                .suggestions(sugg)
                .readyToPost(parsed.path("ready_to_post").asBoolean(false))
                .headline(parsed.path("headline").asText("Review your project description before posting."))
                .aiUsed(true)
                .engine(openRouter ? "openrouter" : "openai")
                .build();
    }

    private static List<String> toStringList(JsonNode arr) {
        List<String> out = new ArrayList<>();
        if (arr == null || !arr.isArray()) {
            return out;
        }
        for (JsonNode n : arr) {
            if (n.isTextual()) {
                out.add(n.asText());
            }
        }
        return out;
    }

    private static String extractJson(String content) {
        if (content == null) {
            return "{}";
        }
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }

    /** Rule-based fallback when no API key or LLM fails */
    public ProjectScopeAnalysisDto heuristicAnalyze(String title, String description) {
        String combined = (title + "\n" + description).toLowerCase();
        List<String> missing = new ArrayList<>();
        List<String> unreal = new ArrayList<>();
        List<String> sugg = new ArrayList<>();

        boolean hasBudget = combined.matches("(?s).*(\\$|€|£|budget|hourly|fixed\\s+price|per\\s+hour|payment|rate|cost).*(?s)");
        boolean hasTimeline = combined.matches("(?s).*(deadline|timeline|by\\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\\d{1,2}\\s*(week|month|day)s?|within\\s+\\d+|due\\s+date|deliver\\s+by).*(?s)")
                || combined.matches(".*\\b(in\\s+\\d+\\s+(week|month|day)s?)\\b.*");
        boolean hasTech = combined.matches("(?s).*(stack|technology|framework|angular|react|vue|node|spring|api|database|sql|mobile|ios|android|cloud|aws|docker|kubernetes).*(?s)");
        boolean hasDeliverables = combined.matches("(?s).*(deliverable|milestone|scope|feature|requirement|user\\s+story|acceptance).*(?s)");

        int words = description.trim().isEmpty() ? 0 : description.trim().split("\\s+").length;
        if (words < 25) {
            missing.add("detail in description");
        }
        if (!hasBudget) {
            missing.add("budget");
        }
        if (!hasTimeline) {
            missing.add("timeline");
        }
        if (!hasTech) {
            missing.add("technical requirements");
        }
        if (!hasDeliverables && words < 60) {
            missing.add("clear deliverables");
        }

        if (combined.contains("unlimited") && combined.contains("budget") && combined.contains("$0")) {
            unreal.add("Conflicting budget signals");
        }
        if (combined.matches(".*\\b(complete\\s+facebook|clone\\s+uber|in\\s+2\\s+days)\\b.*")) {
            unreal.add("Scope may be unrealistic for typical timelines — clarify phased delivery.");
        }

        if (!missing.isEmpty()) {
            sugg.add("Add an explicit budget range (hourly or fixed) and currency.");
            sugg.add("State a target deadline or milestones.");
            sugg.add("List must-have technologies, integrations, and acceptance criteria.");
        } else {
            sugg.add("Consider adding success metrics and communication expectations.");
        }

        String headline = missing.isEmpty()
                ? "Your description covers the basics — consider adding acceptance criteria."
                : "Your project description is missing: " + String.join(", ", missing);

        String quality = missing.size() >= 3 ? "vague" : (missing.isEmpty() ? "good" : "needs_detail");
        boolean ready = missing.isEmpty() && words >= 30;

        return ProjectScopeAnalysisDto.builder()
                .quality(quality)
                .missing(missing)
                .unrealisticNotes(unreal)
                .suggestions(sugg)
                .readyToPost(ready)
                .headline(headline)
                .aiUsed(false)
                .engine("heuristic")
                .build();
    }
}
