package org.example.subscriptionmicroservice.Services;

import org.example.subscriptionmicroservice.Entities.SubscriptionStatus;
import org.example.subscriptionmicroservice.Entities.UserSubscription;
import org.example.subscriptionmicroservice.Integration.UserInAppNotificationClient;
import org.example.subscriptionmicroservice.Repositories.UserSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionExpiryNotificationScheduler {

    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    @Autowired
    private UserInAppNotificationClient userInAppNotificationClient;

    /** Once per day: notify users whose ACTIVE subscription ends in 7 or 1 days. */
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyExpiringSubscriptions() {
        LocalDate today = LocalDate.now();
        LocalDate in7 = today.plusDays(7);
        LocalDate in1 = today.plusDays(1);
        List<UserSubscription> active = userSubscriptionRepository.findByStatus(SubscriptionStatus.ACTIVE);
        for (UserSubscription sub : active) {
            LocalDate end = sub.getEndDate();
            if (end == null) {
                continue;
            }
            if (!end.equals(in7) && !end.equals(in1)) {
                continue;
            }
            String when = end.equals(in1) ? "tomorrow" : "in 7 days";
            userInAppNotificationClient.send(
                    sub.getUserId(),
                    "SUBSCRIPTION_EXPIRING",
                    "Subscription expiring soon",
                    "Your plan ends on " + end + " (" + when + "). Renew from your subscription dashboard to keep access.",
                    "/SubscriptionDashboard",
                    "SUB_EXP:" + sub.getId() + ":" + end
            );
        }
    }
}
