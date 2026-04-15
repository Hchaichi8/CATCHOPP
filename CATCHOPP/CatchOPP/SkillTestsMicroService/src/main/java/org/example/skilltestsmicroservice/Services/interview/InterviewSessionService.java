package org.example.skilltestsmicroservice.Services.interview;

import org.example.skilltestsmicroservice.DTO.interview.InterviewSessionDto;
import org.example.skilltestsmicroservice.DTO.interview.InterviewTurnResponseDto;
import org.example.skilltestsmicroservice.DTO.interview.StartInterviewRequest;
import org.example.skilltestsmicroservice.Entities.interview.InterviewSession;
import org.example.skilltestsmicroservice.Entities.interview.InterviewSessionStatus;
import org.example.skilltestsmicroservice.Entities.interview.InterviewTurn;
import org.example.skilltestsmicroservice.Integration.UserInAppNotificationClient;
import org.example.skilltestsmicroservice.Integration.SubscriptionAiAccessClient;
import org.example.skilltestsmicroservice.Repositories.interview.InterviewSessionRepository;
import org.example.skilltestsmicroservice.Repositories.interview.InterviewTurnRepository;
import org.example.skilltestsmicroservice.Services.gamification.GamificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class InterviewSessionService {

    private static final int QUESTION_COUNT = 5;

    private final InterviewSessionRepository sessionRepository;
    private final InterviewTurnRepository turnRepository;
    private final AiInterviewService aiInterviewService;
    private final GamificationService gamificationService;
    private final UserInAppNotificationClient notificationClient;
    private final SubscriptionAiAccessClient subscriptionAiAccessClient;

    public InterviewSessionService(
            InterviewSessionRepository sessionRepository,
            InterviewTurnRepository turnRepository,
            AiInterviewService aiInterviewService,
            GamificationService gamificationService,
            UserInAppNotificationClient notificationClient,
            SubscriptionAiAccessClient subscriptionAiAccessClient) {
        this.sessionRepository = sessionRepository;
        this.turnRepository = turnRepository;
        this.aiInterviewService = aiInterviewService;
        this.gamificationService = gamificationService;
        this.notificationClient = notificationClient;
        this.subscriptionAiAccessClient = subscriptionAiAccessClient;
    }

    @Transactional
    public InterviewSessionDto startInterview(StartInterviewRequest request) {
        if (request.getUserId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "userId is required");
        }
        boolean hasAiAccess = subscriptionAiAccessClient.hasAiAccess(request.getUserId());
        if (!hasAiAccess) {
            throw new ResponseStatusException(FORBIDDEN, "AI interview requires an active subscription.");
        }
        // Keep gamification subscriber state consistent with Subscription microservice.
        try {
            gamificationService.setSubscriberStatus(request.getUserId(), true);
        } catch (Exception ignored) {
            // Non-fatal: the interview itself can proceed.
        }

        InterviewSession session = new InterviewSession();
        session.setUserId(request.getUserId());
        session.setProjectId(request.getProjectId());
        session.setProjectTitle(trimOrDefault(request.getProjectTitle(), "Untitled Project"));
        session.setRole(trimOrDefault(request.getRole(), "Freelancer"));
        session.setTargetSkills(toSkillsText(request.getSkills()));
        session.setTotalQuestions(QUESTION_COUNT);
        session.setCurrentIndex(0);
        session.setStatus(InterviewSessionStatus.IN_PROGRESS);
        session.setCreatedAt(LocalDateTime.now());
        session = sessionRepository.save(session);

        AiInterviewService.InterviewStartContent start = aiInterviewService.buildStartContent(request);

        InterviewTurn firstTurn = new InterviewTurn();
        firstTurn.setSession(session);
        firstTurn.setQuestionIndex(0);
        firstTurn.setAiQuestion(start.firstQuestion());
        turnRepository.save(firstTurn);

        return new InterviewSessionDto(
                session.getId(),
                start.intro(),
                start.firstQuestion(),
                QUESTION_COUNT,
                1
        );
    }

    @Transactional
    public InterviewTurnResponseDto submitAnswer(Long sessionId, String answer) {
        if (sessionId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "sessionId is required");
        }
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Interview session not found"));
        if (session.getStatus() == InterviewSessionStatus.COMPLETED) {
            throw new ResponseStatusException(BAD_REQUEST, "Interview session is already completed");
        }
        String cleanAnswer = trimOrDefault(answer, "");
        if (cleanAnswer.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Answer must not be empty");
        }

        List<InterviewTurn> turns = turnRepository.findBySessionIdOrderByQuestionIndexAsc(sessionId);
        if (turns.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Session has no questions");
        }

        InterviewTurn currentTurn = turns.get(turns.size() - 1);
        currentTurn.setUserAnswer(cleanAnswer);
        turnRepository.save(currentTurn);

        boolean finished = turns.size() >= QUESTION_COUNT;
        if (!finished) {
            AiInterviewService.InterviewFeedbackNextQuestion fb = aiInterviewService.buildFeedbackAndNextQuestion(session, turns);
            InterviewTurn nextTurn = new InterviewTurn();
            nextTurn.setSession(session);
            nextTurn.setQuestionIndex(turns.size());
            nextTurn.setAiQuestion(fb.nextQuestion());
            turnRepository.save(nextTurn);

            currentTurn.setAiFeedback(fb.feedback());
            turnRepository.save(currentTurn);

            session.setCurrentIndex(nextTurn.getQuestionIndex());
            sessionRepository.save(session);
            return new InterviewTurnResponseDto(
                    session.getId(),
                    nextTurn.getQuestionIndex() + 1,
                    fb.nextQuestion(),
                    fb.feedback(),
                    false,
                    null
            );
        }

        AiInterviewService.InterviewEvaluation evaluation = aiInterviewService.evaluateSession(session, turns);
        currentTurn.setAiFeedback(evaluation.feedback());
        turnRepository.save(currentTurn);

        session.setStatus(InterviewSessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setScore(evaluation.score());
        session.setCurrentIndex(QUESTION_COUNT - 1);
        sessionRepository.save(session);

        try {
            gamificationService.recordInterviewPractice(session.getUserId(), evaluation.score());
        } catch (Exception ignored) {
            // Keep interview completion resilient if gamification storage is unavailable.
        }
        notifyInterviewResult(session, evaluation.score());

        return new InterviewTurnResponseDto(
                session.getId(),
                QUESTION_COUNT,
                null,
                evaluation.feedback(),
                true,
                evaluation.score()
        );
    }

    private void notifyInterviewResult(InterviewSession session, Integer score) {
        String project = trimOrDefault(session.getProjectTitle(), "your target project");
        String title = "AI interview simulation completed";
        String body = "You scored " + score + "/100 for \"" + project + "\". Review feedback and refine your pitch before applying.";
        String link = "/skill-tests/interview/" + session.getId();
        String dedupe = "AI_INTERVIEW:" + session.getId();
        notificationClient.send(session.getUserId(), "AI_INTERVIEW_RESULT", title, body, link, dedupe);
    }

    private static String trimOrDefault(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private static String toSkillsText(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return "communication, planning, technical execution";
        }
        String joined = skills.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));
        return joined.isBlank() ? "communication, planning, technical execution" : joined;
    }
}
