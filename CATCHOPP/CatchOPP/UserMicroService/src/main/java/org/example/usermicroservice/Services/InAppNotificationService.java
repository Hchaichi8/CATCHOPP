package org.example.usermicroservice.Services;

import org.example.usermicroservice.Dto.CreateInAppNotificationRequest;
import org.example.usermicroservice.Entities.InAppNotification;
import org.example.usermicroservice.Entities.NotificationType;
import org.example.usermicroservice.Repositories.InAppNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InAppNotificationService {

    @Autowired
    private InAppNotificationRepository repository;

    public List<InAppNotification> listForUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(Long userId) {
        return repository.countByUserIdAndReadFlagFalse(userId);
    }

    @Transactional
    public InAppNotification markRead(Long notificationId, Long userId) {
        InAppNotification n = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        n.setReadFlag(true);
        return repository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<InAppNotification> list = repository.findByUserIdOrderByCreatedAtDesc(userId);
        for (InAppNotification n : list) {
            if (!n.isReadFlag()) {
                n.setReadFlag(true);
                repository.save(n);
            }
        }
    }

    @Transactional
    public InAppNotification createInternal(CreateInAppNotificationRequest req) {
        if (req.getUserId() == null) {
            throw new IllegalArgumentException("userId required");
        }
        if (req.getType() == null || req.getType().isBlank()) {
            throw new IllegalArgumentException("type required");
        }
        NotificationType type = NotificationType.valueOf(req.getType().trim());

        if (req.getDedupeKey() != null && !req.getDedupeKey().isBlank()) {
            Optional<InAppNotification> existing = repository.findByDedupeKey(req.getDedupeKey());
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        InAppNotification n = InAppNotification.builder()
                .userId(req.getUserId())
                .type(type)
                .title(req.getTitle() != null ? req.getTitle() : "")
                .body(req.getBody() != null ? req.getBody() : "")
                .readFlag(false)
                .link(req.getLink())
                .dedupeKey(req.getDedupeKey() != null && !req.getDedupeKey().isBlank() ? req.getDedupeKey() : null)
                .build();
        return repository.save(n);
    }

    /**
     * Inserts one sample per notification type for local/demo testing (skipped if already seeded via dedupe keys).
     */
    @Transactional
    public int seedDemoNotifications(Long userId) {
        int created = 0;
        created += seedOne(
                userId,
                "DEMO_SEED_" + userId + "_PROPOSAL",
                NotificationType.PROPOSAL_NEW,
                "New proposal on your project",
                "A freelancer submitted a proposal on \"Sample project\".",
                "/ProjectProposals/1");
        created += seedOne(
                userId,
                "DEMO_SEED_" + userId + "_SUB",
                NotificationType.SUBSCRIPTION_EXPIRING,
                "Subscription expiring soon",
                "Your plan ends in 7 days. Renew from your subscription dashboard.",
                "/SubscriptionDashboard");
        created += seedOne(
                userId,
                "DEMO_SEED_" + userId + "_TEST",
                NotificationType.TEST_RESULT,
                "Skill test completed",
                "Your score: 85% on \"Java basics\". Congratulations!",
                "/SkillTestResult/1?score=85&passed=true&title=Java%20basics");
        created += seedOne(
                userId,
                "DEMO_SEED_" + userId + "_REF",
                NotificationType.REFERRAL_SIGNUP,
                "Someone signed up with your referral code",
                "User #99 completed signup using your code.",
                "/ReferralDashboard");
        return created;
    }

    private int seedOne(Long userId, String dedupeKey, NotificationType type, String title, String body, String link) {
        if (repository.findByDedupeKey(dedupeKey).isPresent()) {
            return 0;
        }
        CreateInAppNotificationRequest req = new CreateInAppNotificationRequest();
        req.setUserId(userId);
        req.setType(type.name());
        req.setTitle(title);
        req.setBody(body);
        req.setLink(link);
        req.setDedupeKey(dedupeKey);
        createInternal(req);
        return 1;
    }
}
