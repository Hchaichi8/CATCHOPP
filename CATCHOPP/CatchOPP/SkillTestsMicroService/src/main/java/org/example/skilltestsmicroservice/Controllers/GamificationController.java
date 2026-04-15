package org.example.skilltestsmicroservice.Controllers;

import org.example.skilltestsmicroservice.Dto.gamification.GamificationDashboardDto;
import org.example.skilltestsmicroservice.Dto.gamification.LeaguesOverviewDto;
import org.example.skilltestsmicroservice.Services.gamification.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/SkillTests/gamification")
@CrossOrigin(origins = "*")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    @GetMapping("/dashboard/{userId}")
    public GamificationDashboardDto dashboard(@PathVariable Long userId) {
        return gamificationService.getDashboard(userId);
    }

    /** All leagues, leaderboards, rules, and weekly top-3 prizes (read-only). */
    @GetMapping("/leagues/overview")
    public LeaguesOverviewDto leaguesOverview(@RequestParam(required = false) Long viewerUserId) {
        return gamificationService.getLeaguesOverview(viewerUserId);
    }

    /** Call when freelancer submits an application to a project (from jobs UI). */
    @PostMapping("/event/apply/{userId}")
    public ResponseEntity<Void> recordApply(@PathVariable Long userId) {
        gamificationService.recordProjectApplication(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/event/profile-complete/{userId}")
    public ResponseEntity<Void> profileComplete(@PathVariable Long userId) {
        gamificationService.markProfileComplete(userId);
        return ResponseEntity.ok().build();
    }

    /** Sync subscription status from Angular; grants weekly subscriber league bonus once per Monday-week. */
    @PostMapping("/subscriber/{userId}")
    public ResponseEntity<Void> subscriber(@PathVariable Long userId, @RequestParam boolean active) {
        gamificationService.setSubscriberStatus(userId, active);
        return ResponseEntity.ok().build();
    }
}
