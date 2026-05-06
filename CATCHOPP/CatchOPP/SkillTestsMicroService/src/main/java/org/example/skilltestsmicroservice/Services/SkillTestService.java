package org.example.skilltestsmicroservice.Services;

import org.example.skilltestsmicroservice.DTO.QuestionDTO;
import org.example.skilltestsmicroservice.Entities.Certification;
import org.example.skilltestsmicroservice.Integration.UserInAppNotificationClient;
import org.example.skilltestsmicroservice.Entities.SkillTest;
import org.example.skilltestsmicroservice.Entities.TestQuestion;
import org.example.skilltestsmicroservice.Repositories.CertificationRepository;
import org.example.skilltestsmicroservice.Repositories.SkillTestRepository;
import org.example.skilltestsmicroservice.Repositories.TestQuestionRepository;
import org.example.skilltestsmicroservice.Services.gamification.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SkillTestService {

    private static final int AI_QUESTION_COUNT = 5;
    private static final int AI_PASS_SCORE = 70;
    private static final int AI_DURATION_MINUTES = 15;

    @Value("${ml.api.url:http://localhost:5000}")
    private String mlApiUrl;

    @Autowired
    private SkillTestRepository testRepo;

    @Autowired
    private TestQuestionRepository questionRepo;

    @Autowired
    private CertificationRepository certRepo;

    @Autowired
    private AiQuestionGeneratorService aiGenerator;

    @Autowired
    private UserInAppNotificationClient userInAppNotificationClient;

    @Autowired
    private GamificationService gamificationService;

    public List<SkillTest> getAllTests() {
        return testRepo.findAll();
    }

    public List<SkillTest> getAllActiveTests() {
        return testRepo.findByActiveTrue();
    }

    public SkillTest getTestById(Long id) {
        return testRepo.findById(id).orElseThrow(() -> new RuntimeException("Test not found"));
    }

    public SkillTest createTest(SkillTest test) {
        return testRepo.save(test);
    }

    public SkillTest updateTest(Long id, SkillTest updates) {
        SkillTest existing = getTestById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getDurationMinutes() != null) existing.setDurationMinutes(updates.getDurationMinutes());
        if (updates.getPassScore() != null) existing.setPassScore(updates.getPassScore());
        if (updates.getActive() != null) existing.setActive(updates.getActive());
        return testRepo.save(existing);
    }

    public void deleteTest(Long id) {
        testRepo.deleteById(id);
    }

    public List<TestQuestion> getQuestionsForTest(Long testId) {
        return questionRepo.findBySkillTestId(testId);
    }

    public SkillTest generateAiTest(Long userId, String category, boolean hasAiAccess, String userName) {
        if (!hasAiAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Premium or Enterprise subscription required for AI-generated tests.");
        }
        List<QuestionDTO> questions = aiGenerator.generateQuestions(category, AI_QUESTION_COUNT);

        SkillTest test = new SkillTest();
        test.setTitle(category + " - AI Generated Test");
        test.setDescription("AI-generated skill test for " + category);
        test.setCategory(category);
        test.setDurationMinutes(AI_DURATION_MINUTES);
        test.setPassScore(AI_PASS_SCORE);
        test.setActive(true);
        test = testRepo.save(test);

        for (QuestionDTO dto : questions) {
            TestQuestion q = new TestQuestion();
            q.setSkillTest(test);
            q.setQuestionText(dto.getQuestionText());
            q.setOptionA(dto.getOptionA());
            q.setOptionB(dto.getOptionB());
            q.setOptionC(dto.getOptionC());
            q.setOptionD(dto.getOptionD());
            q.setCorrectOption(dto.getCorrectOption());
            questionRepo.save(q);
        }
        return test;
    }

    public List<String> getAvailableCategories() {
        return aiGenerator.getAvailableCategories();
    }

    public Certification submitTest(Long userId, Long testId, Map<String, String> answers) {
        return submitTest(userId, testId, answers, null);
    }

    public Certification submitTest(Long userId, Long testId, Map<String, String> answers, String userName) {
        SkillTest test = getTestById(testId);
        List<TestQuestion> questions = getQuestionsForTest(testId);

        int correct = 0;
        for (TestQuestion q : questions) {
            String userAnswer = answers.get(String.valueOf(q.getId()));
            if (userAnswer != null && userAnswer.equalsIgnoreCase(q.getCorrectOption())) {
                correct++;
            }
        }

        int score = questions.isEmpty() ? 0 : (correct * 100) / questions.size();
        boolean passed = score >= test.getPassScore();

        Certification cert = new Certification();
        cert.setUserId(userId);
        cert.setUserName(userName);
        cert.setSkillTest(test);
        cert.setTestId(test.getId());
        cert.setTestTitle(test.getTitle());
        cert.setCategory(test.getCategory());
        cert.setScore(score);
        cert.setPassed(passed);

        Certification saved = certRepo.save(cert);
        String resultTitle = passed ? "You passed the skill test" : "Skill test completed";
        String resultBody = String.format(
                "Your score: %d%% on \"%s\". %s",
                score,
                test.getTitle() != null ? test.getTitle() : "the test",
                passed ? "Congratulations!" : "Keep practicing—you can try again anytime."
        );
        String titleParam = URLEncoder.encode(
                test.getTitle() != null ? test.getTitle() : "Skill Test",
                StandardCharsets.UTF_8
        );
        String resultLink = "/SkillTestResult/" + test.getId()
                + "?score=" + score + "&passed=" + passed + "&title=" + titleParam;
        userInAppNotificationClient.send(
                userId,
                "TEST_RESULT",
                resultTitle,
                resultBody,
                resultLink,
                "TEST_RESULT:" + saved.getId()
        );
        if (passed) {
            try {
                gamificationService.onSkillTestPassed(userId);
            } catch (Exception ignored) {
                // avoid failing certification if gamification DB not ready
            }
        }
        return saved;
    }

    public List<Certification> getUserCertifications(Long userId) {
        return certRepo.findByUserId(userId);
    }

    public List<Certification> getAllCertifications() {
        return certRepo.findAll();
    }

    public List<Certification> getPassedCertifications() {
        return certRepo.findAll().stream().filter(Certification::getPassed).collect(Collectors.toList());
    }

    public Map<String, Long> getStatsByCategory() {
        return certRepo.findAll().stream()
                .filter(Certification::getPassed)
                .collect(Collectors.groupingBy(c -> c.getCategory() != null ? c.getCategory() : "Other", Collectors.counting()));
    }

    public Certification getCertificationById(Long id) {
        return certRepo.findById(id).orElseThrow(() -> new RuntimeException("Certification not found"));
    }

    public void deleteCertification(Long id) {
        certRepo.deleteById(id);
    }

    public TestQuestion getQuestionById(Long id) {
        return questionRepo.findById(id).orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public TestQuestion createQuestion(Long testId, TestQuestion question) {
        SkillTest test = getTestById(testId);
        question.setSkillTest(test);
        return questionRepo.save(question);
    }

    public TestQuestion updateQuestion(Long id, TestQuestion updates) {
        TestQuestion existing = getQuestionById(id);
        if (updates.getQuestionText() != null) existing.setQuestionText(updates.getQuestionText());
        if (updates.getOptionA() != null) existing.setOptionA(updates.getOptionA());
        if (updates.getOptionB() != null) existing.setOptionB(updates.getOptionB());
        if (updates.getOptionC() != null) existing.setOptionC(updates.getOptionC());
        if (updates.getOptionD() != null) existing.setOptionD(updates.getOptionD());
        if (updates.getCorrectOption() != null) existing.setCorrectOption(updates.getCorrectOption());
        return questionRepo.save(existing);
    }

    public void deleteQuestion(Long id) {
        questionRepo.deleteById(id);
    }

    // ML — tries Google Colab first, falls back to built-in model if Colab is offline
    @SuppressWarnings("unchecked")
    public Map<String, Object> predictPassProbability(Map<String, Object> data) {
        // Try Colab first if URL is configured
        if (mlApiUrl != null && !mlApiUrl.contains("localhost:5000")) {
            try {
                Map result = WebClient.create(mlApiUrl)
                        .post()
                        .uri("/predict")
                        .header("Content-Type", "application/json")
                        .header("ngrok-skip-browser-warning", "true")
                        .bodyValue(data)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();
                if (result != null) return result;
            } catch (Exception ignored) {
                // Colab offline — fall through to built-in model
            }
        }
        // Built-in fallback model — same formula as the RandomForest training data
        return builtInPredict(data);
    }

    // Replicates the RandomForest scoring logic directly in Java
    // Same weights used to generate training labels in Colab:
    //   score = avg_score*0.5 + tests_taken*1.5 + subscription*5 - difficulty*8 + time_ratio*10
    // Threshold: score > 55 → pass
    private Map<String, Object> builtInPredict(Map<String, Object> data) {
        double testsTaken  = toDouble(data.get("tests_taken"));
        double avgScore    = toDouble(data.get("avg_score"));
        double subscription = toDouble(data.get("subscription"));
        double difficulty  = toDouble(data.get("difficulty"));
        double timeRatio   = toDouble(data.get("time_ratio"));

        double score = avgScore * 0.5
                + testsTaken * 1.5
                + subscription * 5.0
                - difficulty * 8.0
                + timeRatio * 10.0;

        // Convert raw score to a 0-100 confidence using sigmoid-like normalization
        // score range is roughly 10-80, threshold at 55
        double confidence = 1.0 / (1.0 + Math.exp(-(score - 55) / 8.0));
        confidence = Math.round(confidence * 1000.0) / 10.0; // e.g. 87.3

        boolean willPass = score > 55;
        String message = willPass
                ? "High chance of passing! Keep up the good work."
                : "Keep practicing — improve your avg score to boost your odds.";

        return Map.of(
                "will_pass", willPass,
                "confidence", confidence,
                "message", message,
                "source", "built-in-model"
        );
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return 0.0; }
    }

    public Map<String, Object> getTestStatistics(Long testId) {
        SkillTest test = getTestById(testId);
        List<Certification> attempts = certRepo.findAll().stream()
                .filter(c -> c.getSkillTest() != null && c.getSkillTest().getId().equals(testId))
                .collect(Collectors.toList());

        int totalAttempts = attempts.size();
        double averageScore = attempts.isEmpty() ? 0 : 
            attempts.stream().mapToInt(Certification::getScore).average().orElse(0);
        long passedCount = attempts.stream().filter(Certification::getPassed).count();
        double passRate = totalAttempts == 0 ? 0 : (passedCount * 100.0) / totalAttempts;

        // Calculate most failed questions (questions with lowest correct rate)
        List<TestQuestion> questions = getQuestionsForTest(testId);
        
        Map<String, Object> stats = Map.of(
            "testId", testId,
            "testTitle", test.getTitle(),
            "totalAttempts", totalAttempts,
            "averageScore", Math.round(averageScore * 100.0) / 100.0,
            "passRate", Math.round(passRate * 100.0) / 100.0,
            "passedCount", passedCount,
            "failedCount", totalAttempts - passedCount,
            "questionCount", questions.size()
        );

        return stats;
    }
}
