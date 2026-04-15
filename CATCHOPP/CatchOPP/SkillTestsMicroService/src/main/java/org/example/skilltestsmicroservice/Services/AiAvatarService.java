package org.example.skilltestsmicroservice.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.skilltestsmicroservice.Dto.gamification.AvatarFromPhotoGenerateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class AiAvatarService {

    @Value("${ai.openai.api-key}")
    private String openaiApiKey;
    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAvatarService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public AvatarFromPhotoGenerateResponse generateAvatarFromPhoto(
            Long userId,
            String imageBase64,
            String mimeType,
            Integer styleIntensityRaw,
            String genderPreferenceRaw) {
        if (imageBase64 == null || imageBase64.isBlank()) {
            throw new IllegalArgumentException("imageBase64 is required");
        }
        int styleIntensity = Math.max(0, Math.min(100, styleIntensityRaw != null ? styleIntensityRaw : 60));
        String genderPreference = normalizeGenderPreference(genderPreferenceRaw);
        boolean useOpenRouter = isOpenRouterKey(openaiApiKey);
        String chatEndpoint = useOpenRouter
                ? "https://openrouter.ai/api/v1/chat/completions"
                : "https://api.openai.com/v1/chat/completions";
        String chatModel = useOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

        // Fallback when key missing.
        if (openaiApiKey == null || openaiApiKey.isBlank() || openaiApiKey.equals("MOCK")) {
            AvatarFromPhotoGenerateResponse geminiResponse = tryGeminiGeneration(
                    userId, imageBase64, mimeType, styleIntensity, genderPreference, null
            );
            if (geminiResponse != null) return geminiResponse;
            return fallbackDicebearAvatar(userId, imageBase64, mimeType, "OpenAI key missing/invalid.");
        }

        try {
            String stableSeed = stablePhotoSeed(userId, imageBase64, mimeType);

            String prompt = """
                    You are generating a DiceBear avataaars avatar from a user's photo.
                    Analyze the photo and pick the closest matching avatar features.
                    Cartoon style intensity requested (0..100): %STYLE_INTENSITY%.
                    Gender preference: %GENDER_PREFERENCE%.
                    - 0-30: stay closer to realistic face proportions and neutral expressions.
                    - 31-70: balanced cartoon style.
                    - 71-100: stronger cartoonization, brighter colors and expressive face.
                    
                    Gender guidance:
                    - If gender preference is "male", prioritize masculine-coded options (shorter hair defaults, no makeup-like expressions).
                    - If gender preference is "female", prioritize feminine-coded options (longer hair defaults if plausible).
                    - If gender preference is "neutral", avoid strongly gendered assumptions.
                    - If "auto", infer from image only when confident.
                    
                    IMPORTANT:
                    - Return ONLY valid JSON (no markdown, no extra text).
                    - Output these keys exactly:
                      seed, skinColor, top, hairColor, eyes, eyebrows, mouth,
                      facialHair, facialHairProbability, clothing, clothesColor,
                      accessories, accessoriesProbability, backgroundColor
                    - Values:
                      seed: any string (suggest using the provided stable seed)
                      skinColor: hex color string (6 hex digits), e.g. "edb98a"
                      top: one of: %TOPS%
                      hairColor: hex color string (6 hex digits)
                      eyes: one of: %EYES%
                      eyebrows: one of: %EYEBROWS%
                      mouth: one of: %MOUTHS%
                      facialHair: one of: %FACIAL_HAIR%
                      facialHairProbability: integer 0..100
                      clothing: one of: %CLOTHING%
                      clothesColor: hex color string (6 hex digits)
                      accessories: one of: %ACCESSORIES%
                      accessoriesProbability: integer 0..100
                      backgroundColor: hex color string (6 hex digits)
                    
                    If you are unsure, still return something.
                    """;

            // Keep lists aligned with TS UI subset so we don't generate unsupported values.
            // (DiceBear will still accept many other values, but we validate to be safe.)
            String[] TOPS = {"hat", "hijab", "turban", "winterHat1", "winterHat02", "winterHat03", "winterHat04", "bob", "bun", "curly", "curvy", "dreads", "frida", "fro", "froBand", "longButNotTooLong", "miaWallace", "shavedSides", "straight02", "straight01", "straightAndStrand", "dreads01", "dreads02", "frizzle", "shaggy", "shaggyMullet", "shortCurly", "shortFlat", "shortRound", "shortWaved", "sides", "theCaesar", "theCaesarAndSidePart", "bigHair"};
            String[] EYES = {"default", "happy", "hearts", "wink", "surprised", "side", "squint", "cry", "eyeRoll", "closed"};
            String[] EYEBROWS = {"defaultNatural", "raisedExcited", "angry", "sadConcerned", "flatNatural", "unibrowNatural", "default", "unibrowNatural"};
            String[] MOUTHS = {"smile", "default", "serious", "twinkle", "tongue", "grimace", "sad", "concerned"};
            String[] FACIAL_HAIR = {"beardLight", "beardMajestic", "beardMedium", "moustacheFancy", "moustacheMagnum"};
            String[] CLOTHING = {"blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt", "hoodie", "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"};
            String[] ACCESSORIES = {"round", "kurt", "prescription01", "prescription02", "sunglasses", "wayfarers", "eyepatch", "sunglasses"};

            prompt = prompt
                    .replace("%STYLE_INTENSITY%", String.valueOf(styleIntensity))
                    .replace("%GENDER_PREFERENCE%", genderPreference)
                    .replace("%TOPS%", String.join(", ", TOPS))
                    .replace("%EYES%", String.join(", ", EYES))
                    .replace("%EYEBROWS%", String.join(", ", EYEBROWS))
                    .replace("%MOUTHS%", String.join(", ", MOUTHS))
                    .replace("%FACIAL_HAIR%", String.join(", ", FACIAL_HAIR))
                    .replace("%CLOTHING%", String.join(", ", CLOTHING))
                    .replace("%ACCESSORIES%", String.join(", ", ACCESSORIES));

            WebClient client = webClientBuilder.build();
            Map<String, Object> requestBody = Map.of(
                    "model", chatModel,
                    "messages", List.of(Map.of(
                            "role", "user",
                            "content", List.of(
                                    Map.of("type", "text", "text", prompt),
                                    Map.of("type", "image_url", "image_url", Map.of(
                                            "url", "data:" + mimeType + ";base64," + imageBase64
                                    ))
                            )
                    )),
                    "response_format", Map.of("type", "json_object"),
                    "temperature", styleIntensity >= 70 ? 0.45 : 0.25,
                    "max_tokens", 600
            );

            String response;
            try {
                WebClient.RequestBodySpec req = client.post()
                        .uri(chatEndpoint)
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + openaiApiKey);
                if (useOpenRouter) {
                    req = req
                            .header("HTTP-Referer", "http://localhost:4200")
                            .header("X-Title", "CatchOPP Avatar Generator");
                }
                response = req.bodyValue(requestBody).retrieve().bodyToMono(String.class).block();
            } catch (WebClientResponseException ex) {
                String body = ex.getResponseBodyAsString();
                AvatarFromPhotoGenerateResponse geminiResponse = tryGeminiGeneration(
                        userId,
                        imageBase64,
                        mimeType,
                        styleIntensity,
                        genderPreference,
                        "OpenAI HTTP " + ex.getStatusCode().value() + ": " + compactErrorMessage(body, ex.getStatusText())
                );
                if (geminiResponse != null) return geminiResponse;
                return fallbackDicebearAvatar(
                        userId,
                        imageBase64,
                        mimeType,
                        "OpenAI HTTP " + ex.getStatusCode().value() + ": " + compactErrorMessage(body, ex.getStatusText()) +
                                " | Gemini fallback failed/unavailable."
                );
            }

            if (response == null) {
                return fallbackDicebearAvatar(userId, imageBase64, mimeType, "OpenAI returned null.");
            }
            if (response.contains("\"error\"")) {
                AvatarFromPhotoGenerateResponse geminiResponse = tryGeminiGeneration(
                        userId,
                        imageBase64,
                        mimeType,
                        styleIntensity,
                        genderPreference,
                        "OpenAI API error: " + extractApiErrorFromJson(response)
                );
                if (geminiResponse != null) return geminiResponse;
                return fallbackDicebearAvatar(
                        userId,
                        imageBase64,
                        mimeType,
                        "OpenAI API error: " + extractApiErrorFromJson(response) + " | Gemini fallback failed/unavailable."
                );
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            String content = messageContentToText(contentNode);
            String jsonText = extractJson(content);
            JsonNode parsed = objectMapper.readTree(jsonText);

            String skinColor = safeHex(parsed.path("skinColor").asText(), "edb98a");
            String top = parsed.path("top").asText(defaultTopForGender(genderPreference, styleIntensity));
            String hairColor = safeHex(parsed.path("hairColor").asText(), "a55728");
            String eyes = parsed.path("eyes").asText(styleIntensity >= 70 ? "happy" : "default");
            String eyebrows = parsed.path("eyebrows").asText(styleIntensity >= 70 ? "raisedExcited" : "defaultNatural");
            String mouth = parsed.path("mouth").asText(styleIntensity >= 70 ? "twinkle" : "smile");
            String facialHair = parsed.path("facialHair").asText("beardLight");
            int facialHairProbability = clampInt(parsed.path("facialHairProbability").asInt(0), 0, 100);
            String clothing = parsed.path("clothing").asText("hoodie");
            String clothesColor = safeHex(parsed.path("clothesColor").asText(), "65c9ff");
            String accessories = parsed.path("accessories").asText("round");
            int accessoriesProbability = clampInt(parsed.path("accessoriesProbability").asInt(styleIntensity >= 70 ? 35 : 10), 0, 100);
            String backgroundColor = safeHex(parsed.path("backgroundColor").asText(), styleIntensity >= 70 ? "a7ffc4" : "65c9ff");

            if ("male".equals(genderPreference)) {
                top = enforceMaleTop(top);
                facialHairProbability = Math.max(facialHairProbability, styleIntensity >= 60 ? 25 : 12);
            } else if ("female".equals(genderPreference)) {
                top = enforceFemaleTop(top);
                facialHairProbability = 0;
            } else if ("neutral".equals(genderPreference)) {
                facialHairProbability = Math.min(facialHairProbability, 8);
            }

            String seed = parsed.path("seed").asText(stableSeed);
            String avatarUrl = buildDicebearUrl(seed, skinColor, top, hairColor, eyes, eyebrows, mouth,
                    facialHair, facialHairProbability, clothing, clothesColor, accessories, accessoriesProbability, backgroundColor);

            return new AvatarFromPhotoGenerateResponse(
                    avatarUrl,
                    true,
                    "openai-gpt-4o-mini",
                    "AI avatar generated from your photo."
            );
        } catch (Exception e) {
            AvatarFromPhotoGenerateResponse geminiResponse = tryGeminiGeneration(
                    userId, imageBase64, mimeType, styleIntensity, genderPreference, "OpenAI parse/generation failed: " + e.getClass().getSimpleName()
            );
            if (geminiResponse != null) return geminiResponse;
            return fallbackDicebearAvatar(
                    userId,
                    imageBase64,
                    mimeType,
                    "AI parse/generation failed: " + e.getClass().getSimpleName() + " | Gemini fallback failed/unavailable."
            );
        }
    }

    private AvatarFromPhotoGenerateResponse tryGeminiGeneration(
            Long userId,
            String imageBase64,
            String mimeType,
            int styleIntensity,
            String genderPreference,
            String previousFailureReason
    ) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) return null;
        try {
            String stableSeed = stablePhotoSeed(userId, imageBase64, mimeType);
            String prompt = """
                    Generate ONLY valid JSON for a DiceBear avataaars avatar from this photo.
                    Gender preference: %GENDER_PREFERENCE%.
                    Cartoon style intensity (0..100): %STYLE_INTENSITY%.
                    Use these exact keys:
                    seed, skinColor, top, hairColor, eyes, eyebrows, mouth, facialHair, facialHairProbability, clothing, clothesColor, accessories, accessoriesProbability, backgroundColor
                    Keep values realistic and face-like from the image. No markdown.
                    """;
            prompt = prompt
                    .replace("%STYLE_INTENSITY%", String.valueOf(styleIntensity))
                    .replace("%GENDER_PREFERENCE%", genderPreference);

            WebClient client = webClientBuilder.build();
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(
                                    Map.of("text", prompt),
                                    Map.of("inline_data", Map.of("mime_type", mimeType, "data", imageBase64))
                            )
                    )),
                    "generationConfig", Map.of(
                            "temperature", styleIntensity >= 70 ? 0.45 : 0.25,
                            "responseMimeType", "application/json"
                    )
            );

            String response = client.post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + URLEncoder.encode(geminiApiKey, StandardCharsets.UTF_8))
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            if (response == null || response.isBlank()) return null;

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            if (content.isBlank()) return null;
            JsonNode parsed = objectMapper.readTree(extractJson(content));

            String skinColor = safeHex(parsed.path("skinColor").asText(), "edb98a");
            String top = parsed.path("top").asText(defaultTopForGender(genderPreference, styleIntensity));
            String hairColor = safeHex(parsed.path("hairColor").asText(), "a55728");
            String eyes = parsed.path("eyes").asText(styleIntensity >= 70 ? "happy" : "default");
            String eyebrows = parsed.path("eyebrows").asText(styleIntensity >= 70 ? "raisedExcited" : "defaultNatural");
            String mouth = parsed.path("mouth").asText(styleIntensity >= 70 ? "twinkle" : "smile");
            String facialHair = parsed.path("facialHair").asText("beardLight");
            int facialHairProbability = clampInt(parsed.path("facialHairProbability").asInt(0), 0, 100);
            String clothing = parsed.path("clothing").asText("hoodie");
            String clothesColor = safeHex(parsed.path("clothesColor").asText(), "65c9ff");
            String accessories = parsed.path("accessories").asText("round");
            int accessoriesProbability = clampInt(parsed.path("accessoriesProbability").asInt(styleIntensity >= 70 ? 35 : 10), 0, 100);
            String backgroundColor = safeHex(parsed.path("backgroundColor").asText(), styleIntensity >= 70 ? "a7ffc4" : "65c9ff");
            if ("male".equals(genderPreference)) {
                top = enforceMaleTop(top);
                facialHairProbability = Math.max(facialHairProbability, styleIntensity >= 60 ? 25 : 12);
            } else if ("female".equals(genderPreference)) {
                top = enforceFemaleTop(top);
                facialHairProbability = 0;
            } else if ("neutral".equals(genderPreference)) {
                facialHairProbability = Math.min(facialHairProbability, 8);
            }
            String seed = parsed.path("seed").asText(stableSeed);
            String avatarUrl = buildDicebearUrl(seed, skinColor, top, hairColor, eyes, eyebrows, mouth,
                    facialHair, facialHairProbability, clothing, clothesColor, accessories, accessoriesProbability, backgroundColor);

            String note = previousFailureReason == null
                    ? "AI avatar generated from your photo."
                    : "OpenAI failed (" + previousFailureReason + "). Gemini generated the avatar.";
            return new AvatarFromPhotoGenerateResponse(avatarUrl, true, "gemini-1.5-flash", note);
        } catch (Exception ignored) {
            return null;
        }
    }

    private AvatarFromPhotoGenerateResponse fallbackDicebearAvatar(Long userId, String imageBase64, String mimeType, String reason) {
        String seed = userId + "-photo-" + imageBase64.length();
        String avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                URLEncoder.encode(seed, StandardCharsets.UTF_8);
        return new AvatarFromPhotoGenerateResponse(
                avatarUrl,
                false,
                "fallback",
                reason
        );
    }

    private String normalizeGenderPreference(String raw) {
        if (raw == null || raw.isBlank()) return "auto";
        String v = raw.trim().toLowerCase();
        return switch (v) {
            case "male", "female", "neutral", "auto" -> v;
            default -> "auto";
        };
    }

    private boolean isOpenRouterKey(String key) {
        return key != null && key.startsWith("sk-or-v1-");
    }

    private String defaultTopForGender(String gender, int styleIntensity) {
        if ("male".equals(gender)) {
            return styleIntensity >= 65 ? "shortFlat" : "theCaesar";
        }
        if ("female".equals(gender)) {
            return styleIntensity >= 65 ? "longButNotTooLong" : "bob";
        }
        if ("neutral".equals(gender)) {
            return "shortWaved";
        }
        return "hat";
    }

    private String enforceMaleTop(String top) {
        Set<String> shortMale = Set.of("shortFlat", "shortRound", "shortWaved", "theCaesar", "theCaesarAndSidePart");
        return shortMale.contains(top) ? top : "shortFlat";
    }

    private String enforceFemaleTop(String top) {
        Set<String> female = Set.of("longButNotTooLong", "bob", "curly", "curvy", "straight01", "straight02", "straightAndStrand");
        return female.contains(top) ? top : "longButNotTooLong";
    }

    private String stablePhotoSeed(Long userId, String imageBase64, String mimeType) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = digest.digest((userId + ":" + imageBase64 + ":" + mimeType).getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return userId + "-" + sb.substring(0, 12);
    }

    private String extractJson(String content) {
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return content.substring(start, end + 1);
        }
        return content;
    }

    private String messageContentToText(JsonNode contentNode) {
        if (contentNode == null || contentNode.isMissingNode() || contentNode.isNull()) {
            return "{}";
        }
        if (contentNode.isTextual()) {
            return contentNode.asText();
        }
        if (contentNode.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode part : contentNode) {
                if (part.has("text")) {
                    sb.append(part.path("text").asText());
                } else if (part.has("content")) {
                    sb.append(part.path("content").asText());
                } else {
                    sb.append(part.asText(""));
                }
            }
            String merged = sb.toString().trim();
            return merged.isEmpty() ? "{}" : merged;
        }
        return contentNode.asText("{}");
    }

    private String extractApiErrorFromJson(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            String message = root.path("error").path("message").asText("");
            String code = root.path("error").path("code").asText("");
            String type = root.path("error").path("type").asText("");
            String merged = (type + " " + code + " " + message).trim().replaceAll("\\s+", " ");
            return merged.isBlank() ? "unknown error payload" : merged;
        } catch (Exception ignored) {
            return "unparseable error payload";
        }
    }

    private String compactErrorMessage(String body, String fallback) {
        if (body == null || body.isBlank()) {
            return fallback != null ? fallback : "unknown";
        }
        String msg = extractApiErrorFromJson(body);
        if (!"unknown error payload".equals(msg) && !"unparseable error payload".equals(msg)) {
            return msg;
        }
        String compact = body.replaceAll("\\s+", " ").trim();
        return compact.length() > 180 ? compact.substring(0, 180) + "..." : compact;
    }

    private int clampInt(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    private String safeHex(String v, String fallback) {
        if (v == null) return fallback;
        String t = v.trim();
        if (t.matches("^[a-fA-F0-9]{6}$")) {
            return t.toLowerCase();
        }
        return fallback;
    }

    private String buildDicebearUrl(
            String seed,
            String skinColor,
            String top,
            String hairColor,
            String eyes,
            String eyebrows,
            String mouth,
            String facialHair,
            int facialHairProbability,
            String clothing,
            String clothesColor,
            String accessories,
            int accessoriesProbability,
            String backgroundColor
    ) throws Exception {

        // We set backgroundType=solid to keep rendering stable.
        String base = "https://api.dicebear.com/7.x/avataaars/svg";
        Map<String, String> params = new LinkedHashMap<>();
        params.put("seed", seed);
        params.put("skinColor", skinColor);
        params.put("top", top);
        params.put("hairColor", hairColor);
        params.put("eyes", eyes);
        params.put("eyebrows", eyebrows);
        params.put("mouth", mouth);
        params.put("facialHair", facialHair);
        params.put("facialHairProbability", String.valueOf(facialHairProbability));
        params.put("clothing", clothing);
        params.put("clothesColor", clothesColor);
        params.put("accessories", accessories);
        params.put("accessoriesProbability", String.valueOf(accessoriesProbability));
        params.put("backgroundColor", backgroundColor);
        params.put("backgroundType", "solid");

        StringBuilder qs = new StringBuilder();
        for (Iterator<Map.Entry<String, String>> it = params.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<String, String> en = it.next();
            qs.append(URLEncoder.encode(en.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(en.getValue(), StandardCharsets.UTF_8));
            if (it.hasNext()) qs.append('&');
        }
        return base + "?" + qs;
    }
}

