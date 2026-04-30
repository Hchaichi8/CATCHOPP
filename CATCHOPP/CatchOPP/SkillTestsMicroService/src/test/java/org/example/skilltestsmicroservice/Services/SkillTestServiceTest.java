package org.example.skilltestsmicroservice.Services;

import org.example.skilltestsmicroservice.Entities.Certification;
import org.example.skilltestsmicroservice.Entities.SkillTest;
import org.example.skilltestsmicroservice.Entities.TestQuestion;
import org.example.skilltestsmicroservice.Repositories.CertificationRepository;
import org.example.skilltestsmicroservice.Repositories.SkillTestRepository;
import org.example.skilltestsmicroservice.Repositories.TestQuestionRepository;
import org.example.skilltestsmicroservice.Services.gamification.GamificationService;
import org.example.skilltestsmicroservice.Integration.UserInAppNotificationClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SkillTestService Unit Tests")
class SkillTestServiceTest {

    @Mock
    private SkillTestRepository skillTestRepository;

    @Mock
    private TestQuestionRepository questionRepository;

    @Mock
    private CertificationRepository certificationRepository;

    @Mock
    private GamificationService gamificationService;

    @Mock
    private UserInAppNotificationClient userInAppNotificationClient;

    @Mock
    private AiQuestionGeneratorService aiGenerator;

    @InjectMocks
    private SkillTestService skillTestService;

    private SkillTest sampleTest;
    private TestQuestion sampleQuestion;

    @BeforeEach
    void setUp() {
        sampleTest = new SkillTest();
        sampleTest.setId(1L);
        sampleTest.setTitle("Java Basics");
        sampleTest.setCategory("Java");
        sampleTest.setActive(true);
        sampleTest.setPassScore(70);
        sampleTest.setDurationMinutes(30);

        sampleQuestion = new TestQuestion();
        sampleQuestion.setId(1L);
        sampleQuestion.setQuestionText("What is JVM?");
        sampleQuestion.setOptionA("Java Virtual Machine");
        sampleQuestion.setOptionB("Java Variable Method");
        sampleQuestion.setOptionC("Java Version Manager");
        sampleQuestion.setOptionD("None of the above");
        sampleQuestion.setCorrectOption("A");
        sampleQuestion.setSkillTest(sampleTest);
    }

    // ===== CRUD TESTS =====

    @Test
    @DisplayName("getAllTests - should return all tests")
    void getAllTests_shouldReturnAllTests() {
        when(skillTestRepository.findAll()).thenReturn(List.of(sampleTest));

        List<SkillTest> result = skillTestService.getAllTests();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Java Basics");
        verify(skillTestRepository).findAll();
    }

    @Test
    @DisplayName("getAllActiveTests - should return only active tests")
    void getAllActiveTests_shouldReturnOnlyActiveTests() {
        SkillTest inactiveTest = new SkillTest();
        inactiveTest.setActive(false);
        inactiveTest.setTitle("Inactive Test");

        when(skillTestRepository.findByActiveTrue()).thenReturn(List.of(sampleTest));

        List<SkillTest> result = skillTestService.getAllActiveTests();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getActive()).isTrue();
    }

    @Test
    @DisplayName("getTestById - should return test when found")
    void getTestById_shouldReturnTest_whenFound() {
        when(skillTestRepository.findById(1L)).thenReturn(Optional.of(sampleTest));

        SkillTest result = skillTestService.getTestById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Java Basics");
    }

    @Test
    @DisplayName("getTestById - should throw exception when not found")
    void getTestById_shouldThrowException_whenNotFound() {
        when(skillTestRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillTestService.getTestById(99L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("createTest - should save and return new test")
    void createTest_shouldSaveAndReturnTest() {
        when(skillTestRepository.save(any(SkillTest.class))).thenReturn(sampleTest);

        SkillTest result = skillTestService.createTest(sampleTest);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Java Basics");
        verify(skillTestRepository).save(sampleTest);
    }

    @Test
    @DisplayName("deleteTest - should call repository delete")
    void deleteTest_shouldCallRepositoryDelete() {
        doNothing().when(skillTestRepository).deleteById(1L);

        skillTestService.deleteTest(1L);

        verify(skillTestRepository).deleteById(1L);
    }

    @Test
    @DisplayName("getQuestionsForTest - should return questions for given test")
    void getQuestionsForTest_shouldReturnQuestions() {
        when(questionRepository.findBySkillTestId(1L)).thenReturn(List.of(sampleQuestion));

        List<TestQuestion> result = skillTestService.getQuestionsForTest(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuestionText()).isEqualTo("What is JVM?");
    }

    // ===== COMPLEX BUSINESS LOGIC TESTS =====

    @Test
    @DisplayName("submitTest - should pass when score >= passScore")
    void submitTest_shouldPass_whenScoreAboveThreshold() {
        // 2 questions, user answers both correctly → 100% → passes (passScore=70)
        TestQuestion q1 = buildQuestion(1L, "Q1", "A");
        TestQuestion q2 = buildQuestion(2L, "Q2", "B");
        sampleTest.setPassScore(70);

        when(skillTestRepository.findById(1L)).thenReturn(Optional.of(sampleTest));
        when(questionRepository.findBySkillTestId(1L)).thenReturn(List.of(q1, q2));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> answers = Map.of("1", "A", "2", "B");
        Certification cert = skillTestService.submitTest(10L, 1L, answers, "TestUser");

        assertThat(cert.getPassed()).isTrue();
        assertThat(cert.getScore()).isEqualTo(100);
    }

    @Test
    @DisplayName("submitTest - should fail when score < passScore")
    void submitTest_shouldFail_whenScoreBelowThreshold() {
        // 2 questions, user answers none correctly → 0% → fails (passScore=70)
        TestQuestion q1 = buildQuestion(1L, "Q1", "A");
        TestQuestion q2 = buildQuestion(2L, "Q2", "B");
        sampleTest.setPassScore(70);

        when(skillTestRepository.findById(1L)).thenReturn(Optional.of(sampleTest));
        when(questionRepository.findBySkillTestId(1L)).thenReturn(List.of(q1, q2));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> answers = Map.of("1", "C", "2", "D"); // wrong answers
        Certification cert = skillTestService.submitTest(10L, 1L, answers, "TestUser");

        assertThat(cert.getPassed()).isFalse();
        assertThat(cert.getScore()).isEqualTo(0);
    }

    @Test
    @DisplayName("submitTest - should calculate partial score correctly")
    void submitTest_shouldCalculatePartialScore() {
        // 4 questions, user answers 3 correctly → 75% → passes (passScore=70)
        TestQuestion q1 = buildQuestion(1L, "Q1", "A");
        TestQuestion q2 = buildQuestion(2L, "Q2", "B");
        TestQuestion q3 = buildQuestion(3L, "Q3", "C");
        TestQuestion q4 = buildQuestion(4L, "Q4", "D");
        sampleTest.setPassScore(70);

        when(skillTestRepository.findById(1L)).thenReturn(Optional.of(sampleTest));
        when(questionRepository.findBySkillTestId(1L)).thenReturn(List.of(q1, q2, q3, q4));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, String> answers = Map.of("1", "A", "2", "B", "3", "C", "4", "X"); // 3 correct
        Certification cert = skillTestService.submitTest(10L, 1L, answers, "TestUser");

        assertThat(cert.getScore()).isEqualTo(75);
        assertThat(cert.getPassed()).isTrue();
    }

    @Test
    @DisplayName("submitTest - should store userId and testId in certification")
    void submitTest_shouldStoreUserAndTestInfo() {
        TestQuestion q1 = buildQuestion(1L, "Q1", "A");
        when(skillTestRepository.findById(1L)).thenReturn(Optional.of(sampleTest));
        when(questionRepository.findBySkillTestId(1L)).thenReturn(List.of(q1));
        when(certificationRepository.save(any(Certification.class))).thenAnswer(inv -> inv.getArgument(0));

        Certification cert = skillTestService.submitTest(42L, 1L, Map.of("1", "A"), "Alice");

        assertThat(cert.getUserId()).isEqualTo(42L);
        assertThat(cert.getTestId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getUserCertifications - should return certifications for user")
    void getUserCertifications_shouldReturnUserCerts() {
        Certification cert = new Certification();
        cert.setUserId(10L);
        cert.setPassed(true);

        when(certificationRepository.findByUserId(10L)).thenReturn(List.of(cert));

        List<Certification> result = skillTestService.getUserCertifications(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("getStatsByCategory - should group tests by category")
    void getStatsByCategory_shouldGroupByCategory() {
        Certification c1 = new Certification(); c1.setCategory("Java"); c1.setPassed(true);
        Certification c2 = new Certification(); c2.setCategory("Java"); c2.setPassed(true);
        Certification c3 = new Certification(); c3.setCategory("Python"); c3.setPassed(true);

        when(certificationRepository.findAll()).thenReturn(List.of(c1, c2, c3));

        Map<String, Long> stats = skillTestService.getStatsByCategory();

        assertThat(stats).containsEntry("Java", 2L);
        assertThat(stats).containsEntry("Python", 1L);
    }

    @Test
    @DisplayName("updateTest - should update fields and save")
    void updateTest_shouldUpdateAndSave() {
        SkillTest updates = new SkillTest();
        updates.setTitle("Advanced Java");
        updates.setPassScore(80);

        when(skillTestRepository.findById(1L)).thenReturn(Optional.of(sampleTest));
        when(skillTestRepository.save(any(SkillTest.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillTest result = skillTestService.updateTest(1L, updates);

        assertThat(result.getTitle()).isEqualTo("Advanced Java");
        assertThat(result.getPassScore()).isEqualTo(80);
        verify(skillTestRepository).save(any(SkillTest.class));
    }

    // ===== HELPER =====

    private TestQuestion buildQuestion(Long id, String text, String correctAnswer) {
        TestQuestion q = new TestQuestion();
        q.setId(id);
        q.setQuestionText(text);
        q.setOptionA("A"); q.setOptionB("B"); q.setOptionC("C"); q.setOptionD("D");
        q.setCorrectOption(correctAnswer);
        q.setSkillTest(sampleTest);
        return q;
    }
}
