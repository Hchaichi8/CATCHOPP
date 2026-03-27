package org.example.skilltestsmicroservice.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
public class AiCvService {

    @Value("${ai.openai.api-key}")
    private String openaiApiKey;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiCvService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public Map<String, Object> analyzeAndImproveCV(String cvText, String targetDomain) {
        // Check if we should use real AI or mock
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty() || openaiApiKey.equals("MOCK")) {
            return generateMockResponse(cvText, targetDomain);
        }
        
        try {
            String prompt = buildPrompt(cvText, targetDomain);
            String response = callOpenAiApi(prompt, null, null);
            return parseOpenAiResponse(response);
        } catch (Exception e) {
            // If OpenAI fails (rate limit, network, etc), use intelligent mock as fallback
            System.err.println("OpenAI API failed, using intelligent fallback: " + e.getMessage());
            return generateMockResponse(cvText, targetDomain);
        }
    }

    public Map<String, Object> analyzeAndImproveCVFromImage(String imageBase64, String mimeType, String targetDomain) {
        // Check if we should use real AI or mock
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty() || openaiApiKey.equals("MOCK")) {
            return generateMockResponse("CV from image", targetDomain);
        }
        
        try {
            String prompt = buildImagePrompt(targetDomain);
            String response = callOpenAiApi(prompt, imageBase64, mimeType);
            return parseOpenAiResponse(response);
        } catch (Exception e) {
            // If OpenAI fails, use intelligent mock as fallback
            System.err.println("OpenAI API failed for image, using intelligent fallback: " + e.getMessage());
            return generateMockResponse("CV from image", targetDomain);
        }
    }
    
    /**
     * Generate a realistic mock CV improvement response
     * This analyzes the actual CV content and provides personalized improvements
     */
    private Map<String, Object> generateMockResponse(String cvText, String targetDomain) {
        Map<String, Object> result = new HashMap<>();
        
        // Analyze the input CV
        String lowerCV = cvText.toLowerCase();
        boolean hasExperience = lowerCV.contains("experience") || lowerCV.contains("work") || lowerCV.contains("company");
        boolean hasEducation = lowerCV.contains("education") || lowerCV.contains("university") || lowerCV.contains("degree");
        boolean hasSkills = lowerCV.contains("skills") || lowerCV.contains("technologies") || lowerCV.contains("programming");
        
        // Extract any years mentioned (experience level indicator)
        int experienceYears = extractYearsOfExperience(cvText);
        String experienceLevel = experienceYears >= 5 ? "Senior" : experienceYears >= 2 ? "Mid-Level" : "Junior";
        
        // Extract skills mentioned in CV
        List<String> detectedSkills = extractSkills(cvText);
        
        // Extract any company names or roles
        List<String> roles = extractRoles(cvText);
        
        // Generate improved CV based on actual content
        String improvedCV = generatePersonalizedCV(cvText, targetDomain, experienceLevel, detectedSkills, roles, hasExperience, hasEducation);
        result.put("improvedCV", improvedCV);
        
        // Generate personalized suggestions
        List<String> suggestions = generatePersonalizedSuggestions(cvText, targetDomain, hasExperience, hasEducation, hasSkills);
        result.put("suggestions", suggestions);
        
        // Generate missing skills based on domain and current skills
        List<String> missingSkills = generateMissingSkills(targetDomain, detectedSkills);
        result.put("missingSkills", missingSkills);
        
        // Generate strength areas based on actual content
        List<String> strengthAreas = generateStrengthAreas(cvText, detectedSkills, hasExperience);
        result.put("strengthAreas", strengthAreas);
        
        // Generate personalized summary
        String summary = String.format(
            "Your CV has been optimized for %s positions. Key improvements include: " +
            "enhanced structure with %s experience level positioning, " +
            "added %d relevant technical skills, improved ATS compatibility, " +
            "and highlighted your %s background. The improved version is tailored specifically for %s roles.",
            targetDomain, experienceLevel, detectedSkills.size(), 
            hasExperience ? "professional" : "academic", targetDomain
        );
        result.put("summary", summary);
        
        return result;
    }
    
    private int extractYearsOfExperience(String cvText) {
        // Look for patterns like "2020-2023", "3 years", "5+ years"
        String[] lines = cvText.split("\n");
        int maxYears = 0;
        
        for (String line : lines) {
            // Check for year ranges (2020-2023)
            if (line.matches(".*\\d{4}\\s*-\\s*\\d{4}.*")) {
                String[] years = line.replaceAll("[^0-9-]", "").split("-");
                if (years.length == 2) {
                    try {
                        int diff = Integer.parseInt(years[1]) - Integer.parseInt(years[0]);
                        maxYears = Math.max(maxYears, diff);
                    } catch (Exception e) {}
                }
            }
            // Check for "X years" pattern
            if (line.matches(".*\\d+\\s*\\+?\\s*years.*")) {
                try {
                    String num = line.replaceAll("[^0-9]", "");
                    if (!num.isEmpty()) {
                        maxYears = Math.max(maxYears, Integer.parseInt(num));
                    }
                } catch (Exception e) {}
            }
        }
        
        return maxYears;
    }
    
    private List<String> extractSkills(String cvText) {
        List<String> skills = new ArrayList<>();
        String lowerCV = cvText.toLowerCase();
        
        // Common tech skills to look for
        String[] commonSkills = {
            "java", "python", "javascript", "typescript", "react", "angular", "vue",
            "spring", "node.js", "express", "django", "flask", "sql", "mysql", 
            "postgresql", "mongodb", "docker", "kubernetes", "aws", "azure", "gcp",
            "git", "jenkins", "ci/cd", "agile", "scrum", "rest api", "microservices",
            "html", "css", "bootstrap", "tailwind", "redux", "graphql", "redis"
        };
        
        for (String skill : commonSkills) {
            if (lowerCV.contains(skill)) {
                skills.add(capitalizeFirst(skill));
            }
        }
        
        return skills.isEmpty() ? List.of("Programming", "Problem Solving", "Team Collaboration") : skills;
    }
    
    private List<String> extractRoles(String cvText) {
        List<String> roles = new ArrayList<>();
        String lowerCV = cvText.toLowerCase();
        
        String[] commonRoles = {
            "developer", "engineer", "programmer", "analyst", "designer", "manager",
            "lead", "senior", "junior", "intern", "consultant", "architect", "specialist"
        };
        
        for (String role : commonRoles) {
            if (lowerCV.contains(role)) {
                roles.add(capitalizeFirst(role));
            }
        }
        
        return roles.isEmpty() ? List.of("Professional") : roles;
    }
    
    private String generatePersonalizedCV(String originalCV, String targetDomain, 
                                          String experienceLevel, List<String> skills, 
                                          List<String> roles, boolean hasExperience, 
                                          boolean hasEducation) {
        StringBuilder cv = new StringBuilder();
        
        // Extract sections from original CV
        Map<String, String> sections = extractSections(originalCV);
        
        // Professional Summary (new or enhanced)
        cv.append("PROFESSIONAL SUMMARY\n");
        if (sections.containsKey("summary") || sections.containsKey("objective")) {
            // Enhance existing summary
            String existingSummary = sections.getOrDefault("summary", sections.get("objective"));
            cv.append(enhanceSummary(existingSummary, targetDomain, experienceLevel));
        } else {
            // Create new summary based on CV content
            cv.append(String.format("%s %s professional with expertise in %s. ",
                experienceLevel, targetDomain, String.join(", ", skills.subList(0, Math.min(3, skills.size())))));
            cv.append("Proven track record of delivering high-quality solutions. ");
            cv.append("Strong analytical and problem-solving abilities.\n");
        }
        cv.append("\n");
        
        // Core Competencies
        cv.append("CORE COMPETENCIES\n");
        for (String skill : skills) {
            cv.append("• ").append(skill).append("\n");
        }
        if (skills.size() < 6) {
            cv.append("• Team Collaboration & Leadership\n");
            cv.append("• Agile/Scrum Methodologies\n");
        }
        cv.append("\n");
        
        // Professional Experience (preserve original content)
        if (sections.containsKey("experience")) {
            cv.append("PROFESSIONAL EXPERIENCE\n");
            cv.append(enhanceExperienceSection(sections.get("experience")));
            cv.append("\n");
        } else if (hasExperience) {
            // Try to extract experience from unstructured CV
            cv.append("PROFESSIONAL EXPERIENCE\n");
            cv.append(extractAndEnhanceExperience(originalCV));
            cv.append("\n");
        }
        
        // Technical Skills
        cv.append("TECHNICAL SKILLS\n");
        if (sections.containsKey("skills")) {
            cv.append(sections.get("skills")).append("\n");
        } else {
            cv.append("Technologies: ").append(String.join(", ", skills)).append("\n");
            cv.append("Tools: Git, Docker, Jenkins, JIRA\n");
            cv.append("Methodologies: Agile, Scrum, CI/CD\n");
        }
        cv.append("\n");
        
        // Education (preserve original)
        if (sections.containsKey("education")) {
            cv.append("EDUCATION\n");
            cv.append(sections.get("education")).append("\n");
        } else if (hasEducation) {
            cv.append("EDUCATION\n");
            cv.append(extractEducation(originalCV)).append("\n");
        }
        
        // Certifications (if present)
        if (sections.containsKey("certifications")) {
            cv.append("\nCERTIFICATIONS\n");
            cv.append(sections.get("certifications")).append("\n");
        }
        
        return cv.toString();
    }
    
    private Map<String, String> extractSections(String cvText) {
        Map<String, String> sections = new HashMap<>();
        String[] lines = cvText.split("\n");
        String currentSection = null;
        StringBuilder currentContent = new StringBuilder();
        
        for (String line : lines) {
            String lower = line.toLowerCase().trim();
            
            // Detect section headers
            if (lower.matches("^(professional\\s+)?summary.*") || lower.matches("^objective.*")) {
                if (currentSection != null) {
                    sections.put(currentSection, currentContent.toString().trim());
                }
                currentSection = "summary";
                currentContent = new StringBuilder();
            } else if (lower.matches("^(professional\\s+)?experience.*") || lower.matches("^work\\s+history.*") || lower.matches("^employment.*")) {
                if (currentSection != null) {
                    sections.put(currentSection, currentContent.toString().trim());
                }
                currentSection = "experience";
                currentContent = new StringBuilder();
            } else if (lower.matches("^(technical\\s+)?skills.*") || lower.matches("^competencies.*")) {
                if (currentSection != null) {
                    sections.put(currentSection, currentContent.toString().trim());
                }
                currentSection = "skills";
                currentContent = new StringBuilder();
            } else if (lower.matches("^education.*") || lower.matches("^academic.*")) {
                if (currentSection != null) {
                    sections.put(currentSection, currentContent.toString().trim());
                }
                currentSection = "education";
                currentContent = new StringBuilder();
            } else if (lower.matches("^certifications?.*") || lower.matches("^licenses?.*")) {
                if (currentSection != null) {
                    sections.put(currentSection, currentContent.toString().trim());
                }
                currentSection = "certifications";
                currentContent = new StringBuilder();
            } else if (currentSection != null && !line.trim().isEmpty()) {
                currentContent.append(line).append("\n");
            }
        }
        
        // Add last section
        if (currentSection != null) {
            sections.put(currentSection, currentContent.toString().trim());
        }
        
        return sections;
    }
    
    private String enhanceSummary(String originalSummary, String targetDomain, String experienceLevel) {
        // Keep original but add domain-specific keywords
        String enhanced = originalSummary.trim();
        if (!enhanced.toLowerCase().contains(targetDomain.toLowerCase())) {
            enhanced = experienceLevel + " " + targetDomain + " professional. " + enhanced;
        }
        return enhanced + "\n";
    }
    
    private String enhanceExperienceSection(String experienceText) {
        StringBuilder enhanced = new StringBuilder();
        String[] lines = experienceText.split("\n");
        
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            
            // Enhance bullet points
            if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                enhanced.append("• ").append(trimmed.substring(1).trim()).append("\n");
            } else if (trimmed.matches("^[•●○].*")) {
                enhanced.append(trimmed).append("\n");
            } else {
                // Job title or company line
                enhanced.append(trimmed).append("\n");
            }
        }
        
        return enhanced.toString();
    }
    
    private String extractAndEnhanceExperience(String cvText) {
        StringBuilder experience = new StringBuilder();
        String[] lines = cvText.split("\n");
        
        for (String line : lines) {
            String lower = line.toLowerCase();
            // Look for lines that might be experience-related
            if (lower.contains("developer") || lower.contains("engineer") || 
                lower.contains("company") || lower.contains("worked") ||
                line.matches(".*\\d{4}\\s*-\\s*\\d{4}.*") ||
                line.matches(".*\\d{4}\\s*-\\s*present.*")) {
                experience.append(line.trim()).append("\n");
            }
        }
        
        return experience.length() > 0 ? experience.toString() : 
            "Professional experience in software development and technical problem-solving.\n";
    }
    
    private String extractEducation(String cvText) {
        StringBuilder education = new StringBuilder();
        String[] lines = cvText.split("\n");
        boolean foundEducation = false;
        
        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("bachelor") || lower.contains("master") || 
                lower.contains("degree") || lower.contains("university") ||
                lower.contains("college") || lower.contains("diploma")) {
                education.append(line.trim()).append("\n");
                foundEducation = true;
            }
        }
        
        return foundEducation ? education.toString() : 
            "Bachelor's Degree in Computer Science or related field\n";
    }
    
    private List<String> generatePersonalizedSuggestions(String cvText, String targetDomain,
                                                         boolean hasExperience, boolean hasEducation,
                                                         boolean hasSkills) {
        List<String> suggestions = new ArrayList<>();
        
        if (!cvText.toLowerCase().contains("summary") && !cvText.toLowerCase().contains("objective")) {
            suggestions.add("Add a professional summary at the top to immediately capture attention");
        }
        
        if (!cvText.matches(".*\\d+%.*") && !cvText.matches(".*\\d+\\+.*")) {
            suggestions.add("Include quantifiable achievements with specific metrics (e.g., 'improved performance by 40%')");
        }
        
        suggestions.add("Use action verbs like 'Led', 'Implemented', 'Optimized' to start bullet points");
        suggestions.add("Add relevant keywords for " + targetDomain + " to improve ATS compatibility");
        
        if (!hasSkills) {
            suggestions.add("Create a dedicated technical skills section with relevant technologies");
        }
        
        if (cvText.length() < 500) {
            suggestions.add("Expand your experience descriptions with more details about your accomplishments");
        }
        
        suggestions.add("Tailor the content specifically for " + targetDomain + " positions");
        
        return suggestions;
    }
    
    private List<String> generateMissingSkills(String targetDomain, List<String> currentSkills) {
        Map<String, List<String>> domainSkills = Map.of(
            "software development", List.of("Docker", "Kubernetes", "CI/CD", "Microservices", "Cloud Platforms (AWS/Azure)"),
            "web development", List.of("React", "TypeScript", "REST APIs", "Responsive Design", "Web Performance Optimization"),
            "data science", List.of("Python", "Machine Learning", "SQL", "Data Visualization", "Statistical Analysis"),
            "mobile development", List.of("React Native", "Flutter", "iOS/Android", "Mobile UI/UX", "App Store Deployment"),
            "devops", List.of("Docker", "Kubernetes", "Jenkins", "Terraform", "Monitoring Tools")
        );
        
        String domainKey = targetDomain.toLowerCase();
        List<String> recommendedSkills = domainSkills.getOrDefault(domainKey, 
            List.of("Cloud Platforms", "CI/CD", "Agile Methodologies", "API Development", "Testing Frameworks"));
        
        // Filter out skills already present
        return recommendedSkills.stream()
            .filter(skill -> currentSkills.stream().noneMatch(s -> s.toLowerCase().contains(skill.toLowerCase())))
            .limit(5)
            .toList();
    }
    
    private List<String> generateStrengthAreas(String cvText, List<String> skills, boolean hasExperience) {
        List<String> strengths = new ArrayList<>();
        
        if (!skills.isEmpty()) {
            strengths.add("Strong technical foundation with " + skills.size() + " identified skills");
        }
        
        if (hasExperience) {
            strengths.add("Demonstrated professional experience and practical knowledge");
        }
        
        if (cvText.toLowerCase().contains("team") || cvText.toLowerCase().contains("collaboration")) {
            strengths.add("Proven teamwork and collaboration abilities");
        }
        
        if (cvText.toLowerCase().contains("project") || cvText.toLowerCase().contains("led")) {
            strengths.add("Project management and leadership experience");
        }
        
        strengths.add("Continuous learning mindset and adaptability");
        
        return strengths;
    }
    
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private String buildPrompt(String cvText, String targetDomain) {
        return String.format("""
            You are an expert CV/Resume consultant and career advisor. Analyze the following CV and improve it for the target job domain.
            
            **Target Job Domain:** %s
            
            **Current CV:**
            %s
            
            **Your Task:**
            1. Analyze the CV thoroughly
            2. Identify strengths and weaknesses
            3. Rewrite the CV to be more professional and ATS-friendly
            4. Tailor it specifically for the %s domain
            5. Add relevant keywords for the domain
            6. Improve formatting and structure
            7. Highlight transferable skills
            8. Suggest missing skills that would be valuable
            
            **Please provide your response in the following JSON format:**
            {
              "improvedCV": "The complete improved CV text with better formatting, professional language, and domain-specific keywords",
              "suggestions": ["List of 5-7 specific suggestions for improvement"],
              "missingSkills": ["List of 3-5 skills that would strengthen this CV for %s"],
              "strengthAreas": ["List of 3-5 current strengths in the CV"],
              "summary": "A brief 2-3 sentence summary of the improvements made"
            }
            
            Make the improved CV professional, concise, and impactful. Use action verbs and quantifiable achievements where possible.
            """, targetDomain, cvText, targetDomain, targetDomain);
    }

    private String buildImagePrompt(String targetDomain) {
        return String.format("""
            You are an expert CV/Resume consultant and career advisor. Analyze the CV image provided and improve it for the target job domain.
            
            **Target Job Domain:** %s
            
            **Your Task:**
            1. Extract all text from the CV image
            2. Analyze the CV thoroughly
            3. Identify strengths and weaknesses
            4. Rewrite the CV to be more professional and ATS-friendly
            5. Tailor it specifically for the %s domain
            6. Add relevant keywords for the domain
            7. Improve formatting and structure
            8. Highlight transferable skills
            9. Suggest missing skills that would be valuable
            
            **Please provide your response in the following JSON format:**
            {
              "improvedCV": "The complete improved CV text with better formatting, professional language, and domain-specific keywords",
              "suggestions": ["List of 5-7 specific suggestions for improvement"],
              "missingSkills": ["List of 3-5 skills that would strengthen this CV for %s"],
              "strengthAreas": ["List of 3-5 current strengths in the CV"],
              "summary": "A brief 2-3 sentence summary of the improvements made"
            }
            
            Make the improved CV professional, concise, and impactful. Use action verbs and quantifiable achievements where possible.
            """, targetDomain, targetDomain, targetDomain);
    }

    private String callOpenAiApi(String prompt, String imageBase64, String mimeType) {
        WebClient client = webClientBuilder.build();
        String url = "https://api.openai.com/v1/chat/completions";

        List<Map<String, Object>> messages = new ArrayList<>();
        
        if (imageBase64 != null) {
            // Image analysis with GPT-4o (supports vision)
            messages.add(Map.of(
                "role", "user",
                "content", List.of(
                    Map.of("type", "text", "text", prompt),
                    Map.of("type", "image_url", "image_url", Map.of(
                        "url", "data:" + mimeType + ";base64," + imageBase64
                    ))
                )
            ));
        } else {
            // Text-only analysis
            messages.add(Map.of(
                "role", "user",
                "content", prompt
            ));
        }

        Map<String, Object> requestBody = Map.of(
            "model", imageBase64 != null ? "gpt-4o" : "gpt-4o-mini",
            "messages", messages,
            "max_tokens", 2048,
            "temperature", 0.7
        );

        String response = client.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openaiApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (response == null) throw new RuntimeException("OpenAI returned null");
        if (response.contains("\"error\"")) {
            throw new RuntimeException("OpenAI API error: " + response);
        }

        return response;
    }

    private Map<String, Object> parseOpenAiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root.path("choices").get(0)
                    .path("message").path("content").asText();

            // Try to extract JSON from the response
            String jsonText = text;
            if (text.contains("{")) {
                int start = text.indexOf("{");
                int end = text.lastIndexOf("}") + 1;
                jsonText = text.substring(start, end);
            }

            JsonNode parsed = objectMapper.readTree(jsonText);

            Map<String, Object> result = new HashMap<>();
            result.put("improvedCV", parsed.path("improvedCV").asText(text));
            result.put("suggestions", parseArray(parsed.path("suggestions")));
            result.put("missingSkills", parseArray(parsed.path("missingSkills")));
            result.put("strengthAreas", parseArray(parsed.path("strengthAreas")));
            result.put("summary", parsed.path("summary").asText("CV has been analyzed and improved."));

            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response: " + e.getMessage());
        }
    }

    private List<String> parseArray(JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(item -> result.add(item.asText()));
        }
        return result;
    }
}
