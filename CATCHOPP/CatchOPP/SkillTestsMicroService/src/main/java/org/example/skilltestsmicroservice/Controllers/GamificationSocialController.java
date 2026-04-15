package org.example.skilltestsmicroservice.Controllers;

import org.example.skilltestsmicroservice.Dto.gamification.EncourageRequestDto;
import org.example.skilltestsmicroservice.Dto.gamification.EncouragementPageDto;
import org.example.skilltestsmicroservice.Dto.gamification.UpdateEncouragementDto;
import org.example.skilltestsmicroservice.Dto.gamification.AvatarFromPhotoGenerateRequest;
import org.example.skilltestsmicroservice.Dto.gamification.AvatarFromPhotoGenerateResponse;
import org.example.skilltestsmicroservice.Dto.gamification.FollowingUserDto;
import org.example.skilltestsmicroservice.Dto.gamification.LeaguePublicProfileDto;
import org.example.skilltestsmicroservice.Dto.gamification.UpdatePublicProfileDto;
import org.example.skilltestsmicroservice.Dto.gamification.WeeklyXpSeriesDto;
import org.example.skilltestsmicroservice.Services.gamification.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/SkillTests/gamification/social")
@CrossOrigin(origins = "*")
public class GamificationSocialController {

    @Autowired
    private GamificationService gamificationService;

    @PutMapping("/profile/{userId}")
    public ResponseEntity<Void> updateProfile(@PathVariable Long userId, @RequestBody UpdatePublicProfileDto dto) {
        gamificationService.updatePublicProfile(userId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile/{userId}")
    public LeaguePublicProfileDto getPublicProfile(
            @PathVariable Long userId,
            @RequestParam(required = false) Long viewerUserId) {
        return gamificationService.getPublicProfile(userId, viewerUserId);
    }

    @PostMapping("/follow")
    public ResponseEntity<Void> follow(@RequestParam Long followerId, @RequestParam Long targetUserId) {
        gamificationService.follow(followerId, targetUserId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/follow")
    public ResponseEntity<Void> unfollow(@RequestParam Long followerId, @RequestParam Long targetUserId) {
        gamificationService.unfollow(followerId, targetUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/encourage")
    public ResponseEntity<Void> encourage(@RequestBody EncourageRequestDto dto) {
        gamificationService.postEncouragement(dto);
        return ResponseEntity.ok().build();
    }

    /** Public cheers on this profile (newest first), paginated for scrolling. */
    @GetMapping("/encouragements/{targetUserId}")
    public EncouragementPageDto encouragements(
            @PathVariable Long targetUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long viewerUserId) {
        return gamificationService.listEncouragementsPaged(targetUserId, page, size, viewerUserId);
    }

    /** Toggle or change emoji reaction on a cheer (one reaction per user per comment). */
    @PostMapping("/encouragements/{encouragementId}/react")
    public ResponseEntity<Void> react(
            @PathVariable Long encouragementId,
            @RequestParam Long userId,
            @RequestParam(required = false) String emoji) {
        gamificationService.reactToEncouragement(encouragementId, userId, emoji);
        return ResponseEntity.ok().build();
    }

    /** Edit your own public cheer (message text or GIF URL). */
    @PutMapping("/encouragements/{encouragementId}")
    public ResponseEntity<Void> editEncouragement(
            @PathVariable Long encouragementId,
            @RequestParam Long userId,
            @RequestBody UpdateEncouragementDto dto) {
        gamificationService.editEncouragement(encouragementId, userId, dto.getMessage());
        return ResponseEntity.ok().build();
    }

    /** Delete your own public cheer. */
    @DeleteMapping("/encouragements/{encouragementId}")
    public ResponseEntity<Void> deleteEncouragement(
            @PathVariable Long encouragementId,
            @RequestParam Long userId) {
        gamificationService.deleteEncouragement(encouragementId, userId);
        return ResponseEntity.ok().build();
    }

    /** Freelancers this user follows (for profile “Following” list). */
    @GetMapping("/following/{userId}")
    public List<FollowingUserDto> following(@PathVariable Long userId) {
        return gamificationService.listFollowing(userId);
    }

    /** Freelancers who follow this user (for profile “Followers” list). */
    @GetMapping("/followers/{userId}")
    public List<FollowingUserDto> followers(@PathVariable Long userId) {
        return gamificationService.listFollowers(userId);
    }

    /** Generates a league avatar from an uploaded photo (base64). */
    @PostMapping("/avatar/from-photo/{userId}")
    public AvatarFromPhotoGenerateResponse avatarFromPhoto(
            @PathVariable Long userId,
            @RequestBody AvatarFromPhotoGenerateRequest request) {
        return gamificationService.generateAvatarFromPhoto(
                userId,
                request.getImageBase64(),
                request.getMimeType(),
                request.getStyleIntensity(),
                request.getGenderPreference()
        );
    }

    /** Last 7 days XP trend for profile vs viewer/top competitor. */
    @GetMapping("/xp-weekly/{userId}")
    public WeeklyXpSeriesDto xpWeekly(
            @PathVariable Long userId,
            @RequestParam(required = false) Long viewerUserId) {
        return gamificationService.getWeeklyXpSeries(userId, viewerUserId);
    }
}
