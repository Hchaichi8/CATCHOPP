package org.example.skilltestsmicroservice.Services.gamification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LeagueWeeklyResetScheduler {

    private static final Logger log = LoggerFactory.getLogger(LeagueWeeklyResetScheduler.class);

    @Autowired
    private GamificationService gamificationService;

    @Scheduled(cron = "0 0 2 * * MON")
    public void weeklyLeagueReset() {
        log.info("Running weekly freelancer league reset...");
        try {
            gamificationService.runWeeklyLeagueCycle();
            log.info("Weekly league reset completed.");
        } catch (Exception e) {
            log.error("Weekly league reset failed", e);
        }
    }
}
