package org.example.skilltestsmicroservice.Services.gamification;

import org.example.skilltestsmicroservice.Dto.gamification.*;
import org.example.skilltestsmicroservice.Entities.gamification.DailyChallengeProgress;
import org.example.skilltestsmicroservice.Entities.gamification.FreelancerGamificationProfile;
import org.example.skilltestsmicroservice.Entities.gamification.LeagueEncouragement;
import org.example.skilltestsmicroservice.Entities.gamification.LeagueEncouragementReaction;
import org.example.skilltestsmicroservice.Entities.gamification.LeagueFollow;
import org.example.skilltestsmicroservice.Entities.gamification.LeagueTier;
import org.example.skilltestsmicroservice.Entities.gamification.LeagueXpDailyStat;
import org.example.skilltestsmicroservice.Services.AiAvatarService;
import org.example.skilltestsmicroservice.Repositories.gamification.DailyChallengeProgressRepository;
import org.example.skilltestsmicroservice.Repositories.gamification.FreelancerGamificationProfileRepository;
import org.example.skilltestsmicroservice.Repositories.gamification.LeagueEncouragementReactionRepository;
import org.example.skilltestsmicroservice.Repositories.gamification.LeagueEncouragementRepository;
import org.example.skilltestsmicroservice.Repositories.gamification.LeagueFollowRepository;
import org.example.skilltestsmicroservice.Repositories.gamification.LeagueXpDailyStatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    public static final String CODE_APPLY = "APPLY_PROJECTS";
    public static final String CODE_PROFILE = "COMPLETE_PROFILE";
    public static final String CODE_PASS_TEST = "PASS_SKILL_TEST";
    public static final String CODE_INTERVIEW = "AI_INTERVIEW_PRACTICE";

    @Autowired
    private FreelancerGamificationProfileRepository profileRepo;

    @Autowired
    private DailyChallengeProgressRepository challengeRepo;

    @Autowired
    private LeagueFollowRepository followRepo;

    @Autowired
    private LeagueEncouragementRepository encouragementRepo;

    @Autowired
    private LeagueEncouragementReactionRepository encouragementReactionRepo;

    @Autowired
    private AiAvatarService aiAvatarService;

    @Autowired
    private LeagueXpDailyStatRepository xpDailyStatRepo;

    private static final Set<String> ALLOWED_REACTION_EMOJI = Set.of(
            "👍", "❤️", "🔥", "👏", "😂", "🎉", "✨", "💪", "🙌", "⭐"
    );

    public LocalDate mondayThisWeek() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    @Transactional
    public FreelancerGamificationProfile getOrCreateProfile(Long userId) {
        return profileRepo.findByUserId(userId).orElseGet(() -> {
            FreelancerGamificationProfile p = FreelancerGamificationProfile.builder()
                    .userId(userId)
                    .totalPoints(0)
                    .leagueTier(LeagueTier.BRONZE)
                    .weeklyLeagueXp(0)
                    .leagueWeekStartMonday(mondayThisWeek())
                    .activeSubscriber(false)
                    .badges(new HashSet<>())
                    .build();
            return profileRepo.save(p);
        });
    }

    @Transactional(readOnly = true)
    public boolean isActiveSubscriber(Long userId) {
        if (userId == null) {
            return false;
        }
        return profileRepo.findByUserId(userId)
                .map(FreelancerGamificationProfile::getActiveSubscriber)
                .map(Boolean.TRUE::equals)
                .orElse(false);
    }

    @Transactional
    public void ensureTodayChallenges(Long userId) {
        LocalDate today = LocalDate.now();
        List<DailyChallengeProgress> existing = challengeRepo.findByUserIdAndChallengeDateOrderByIdAsc(userId, today);
        if (existing.size() >= 3) {
            return;
        }
        if (!existing.isEmpty()) {
            return;
        }

        DailyChallengeTemplate apply = pickDailyVariant(today, CODE_APPLY, applyVariants());
        DailyChallengeTemplate profile = pickDailyVariant(today, CODE_PROFILE, profileVariants());
        DailyChallengeTemplate test = pickDailyVariant(today, CODE_PASS_TEST, passTestVariants());

        challengeRepo.save(DailyChallengeProgress.builder()
                .userId(userId)
                .challengeDate(today)
                .challengeCode(apply.code())
                .title(apply.title())
                .targetCount(apply.targetCount())
                .currentCount(0)
                .pointsReward(apply.pointsReward())
                .completed(false)
                .build());
        challengeRepo.save(DailyChallengeProgress.builder()
                .userId(userId)
                .challengeDate(today)
                .challengeCode(profile.code())
                .title(profile.title())
                .targetCount(profile.targetCount())
                .currentCount(0)
                .pointsReward(profile.pointsReward())
                .completed(false)
                .build());
        challengeRepo.save(DailyChallengeProgress.builder()
                .userId(userId)
                .challengeDate(today)
                .challengeCode(test.code())
                .title(test.title())
                .targetCount(test.targetCount())
                .currentCount(0)
                .pointsReward(test.pointsReward())
                .completed(false)
                .build());
    }

    private record DailyChallengeTemplate(String code, String title, int targetCount, int pointsReward) {}

    private DailyChallengeTemplate pickDailyVariant(LocalDate day, String code, List<DailyChallengeTemplate> variants) {
        if (variants.isEmpty()) {
            return new DailyChallengeTemplate(code, code, 1, 50);
        }
        long seed = Math.abs(Objects.hash(day.toEpochDay(), code));
        int idx = (int) (seed % variants.size());
        DailyChallengeTemplate picked = variants.get(idx);
        // Ensure the stored challengeCode stays stable (used by bumpChallenge).
        return new DailyChallengeTemplate(code, picked.title(), picked.targetCount(), picked.pointsReward());
    }

    private List<DailyChallengeTemplate> applyVariants() {
        return List.of(
                new DailyChallengeTemplate(CODE_APPLY, "Apply to 1 project today", 1, 25),
                new DailyChallengeTemplate(CODE_APPLY, "Apply to 2 projects today", 2, 40),
                new DailyChallengeTemplate(CODE_APPLY, "Apply to 3 projects today", 3, 55),
                new DailyChallengeTemplate(CODE_APPLY, "Apply to 5 projects today", 5, 90),
                new DailyChallengeTemplate(CODE_APPLY, "Apply to 7 projects today", 7, 120)
        );
    }

    private List<DailyChallengeTemplate> profileVariants() {
        return List.of(
                new DailyChallengeTemplate(CODE_PROFILE, "Complete your profile", 1, 80),
                new DailyChallengeTemplate(CODE_PROFILE, "Polish your profile today", 1, 100),
                new DailyChallengeTemplate(CODE_PROFILE, "Update your profile details", 1, 120),
                new DailyChallengeTemplate(CODE_PROFILE, "Make your profile stand out", 1, 140)
        );
    }

    private List<DailyChallengeTemplate> passTestVariants() {
        return List.of(
                new DailyChallengeTemplate(CODE_PASS_TEST, "Pass a skill test today", 1, 120),
                new DailyChallengeTemplate(CODE_PASS_TEST, "Win a skill test today", 1, 160),
                new DailyChallengeTemplate(CODE_PASS_TEST, "Prove your skills (pass 1 test)", 1, 200),
                new DailyChallengeTemplate(CODE_PASS_TEST, "Level up: pass a test today", 1, 240)
        );
    }

    @Transactional
    public void onSkillTestPassed(Long userId) {
        ensureTodayChallenges(userId);
        bumpChallenge(userId, CODE_PASS_TEST, 1);
    }

    @Transactional
    public void recordInterviewPractice(Long userId, int score) {
        FreelancerGamificationProfile p = getOrCreateProfile(userId);
        int boundedScore = Math.max(0, Math.min(100, score));
        int basePoints = 20 + (boundedScore / 4); // 20..45 points
        int points = applySubscriberMultiplier(p, basePoints);

        p.setTotalPoints(p.getTotalPoints() + points);
        p.setWeeklyLeagueXp(p.getWeeklyLeagueXp() + points);
        bumpDailyXp(userId, points);
        touchStreak(userId);

        if (boundedScore >= 85) {
            p.getBadges().add("INTERVIEW_READY");
        }
        profileRepo.save(p);
    }

    @Transactional
    public void recordProjectApplication(Long userId) {
        ensureTodayChallenges(userId);
        bumpChallenge(userId, CODE_APPLY, 1);
    }

    @Transactional
    public void markProfileComplete(Long userId) {
        ensureTodayChallenges(userId);
        challengeRepo.findByUserIdAndChallengeDateAndChallengeCode(userId, LocalDate.now(), CODE_PROFILE)
                .ifPresent(c -> {
                    if (!c.isCompleted()) {
                        c.setCurrentCount(c.getTargetCount());
                        challengeRepo.save(c);
                        tryCompleteChallenge(c);
                    }
                });
    }

    @Transactional
    public void setSubscriberStatus(Long userId, boolean active) {
        FreelancerGamificationProfile p = getOrCreateProfile(userId);
        p.setActiveSubscriber(active);
        if (active) {
            LocalDate mon = mondayThisWeek();
            if (p.getLastSubscriberBoostWeek() == null || !p.getLastSubscriberBoostWeek().equals(mon)) {
                p.setLastSubscriberBoostWeek(mon);
                p.setWeeklyLeagueXp(p.getWeeklyLeagueXp() + 30);
                p.setTotalPoints(p.getTotalPoints() + 30);
                bumpDailyXp(userId, 30);
                if (!p.getBadges().contains("SUBSCRIBER")) {
                    p.getBadges().add("SUBSCRIBER");
                }
            }
        }
        profileRepo.save(p);
    }

    @Transactional
    public GamificationDashboardDto getDashboard(Long userId) {
        getOrCreateProfile(userId);
        ensureTodayChallenges(userId);
        FreelancerGamificationProfile p = profileRepo.findByUserId(userId).orElseThrow();

        LocalDate today = LocalDate.now();
        List<DailyChallengeProgress> challenges = challengeRepo.findByUserIdAndChallengeDateOrderByIdAsc(userId, today);

        long tierSize = profileRepo.countByLeagueTier(p.getLeagueTier());
        if (tierSize == 0) {
            tierSize = 1;
        }
        long better = profileRepo.countByLeagueTierAndWeeklyLeagueXpGreaterThan(p.getLeagueTier(), p.getWeeklyLeagueXp());
        int rank = (int) better + 1;

        List<FreelancerGamificationProfile> top = profileRepo.findByLeagueTierOrderByWeeklyLeagueXpDesc(p.getLeagueTier())
                .stream()
                .limit(12)
                .toList();
        List<GamificationDashboardDto.LeagueBoardRowDto> board = top.stream()
                .map(x -> new GamificationDashboardDto.LeagueBoardRowDto(
                        x.getUserId(),
                        x.getWeeklyLeagueXp(),
                        displayNameOrDefault(x),
                        x.getAvatarUrl(),
                        x.getLocation(),
                        x.getStreakDays(),
                        followRepo.countByFollowingUserId(x.getUserId()),
                        followRepo.existsByFollowerUserIdAndFollowingUserId(userId, x.getUserId())
                ))
                .collect(Collectors.toList());

        List<GamificationDashboardDto.DailyChallengeViewDto> chViews = challenges.stream()
                .map(c -> new GamificationDashboardDto.DailyChallengeViewDto(
                        c.getId(),
                        c.getChallengeCode(),
                        c.getTitle(),
                        c.getTargetCount(),
                        c.getCurrentCount(),
                        c.getPointsReward(),
                        c.isCompleted()
                ))
                .collect(Collectors.toList());

        ZonedDateTime now = ZonedDateTime.now();
        LocalDate nextMon = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        String nextReset = nextMon.atStartOfDay(now.getZone()).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        return new GamificationDashboardDto(
                userId,
                p.getTotalPoints(),
                p.getLeagueTier().name(),
                p.getWeeklyLeagueXp(),
                p.getLeagueWeekStartMonday() != null ? p.getLeagueWeekStartMonday().toString() : "",
                Boolean.TRUE.equals(p.getActiveSubscriber()),
                new ArrayList<>(p.getBadges()),
                chViews,
                nextReset,
                rank,
                tierSize,
                board
        );
    }

    @Transactional(readOnly = true)
    public LeaguesOverviewDto getLeaguesOverview(Long viewerUserId) {
        LeagueRulesDto rules = buildLeagueRules();
        List<TierSnapshotDto> tiers = new ArrayList<>();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        for (LeagueTier t : LeagueTier.values()) {
            long count = profileRepo.countByLeagueTier(t);
            List<FreelancerGamificationProfile> ordered = profileRepo.findByLeagueTierOrderByWeeklyLeagueXpDesc(t);
            List<TierLeaderRowDto> top = new ArrayList<>();
            int r = 1;
            for (FreelancerGamificationProfile fp : ordered) {
                if (r > 15) {
                    break;
                }
                top.add(toTierLeaderRow(fp, r, viewerUserId, weekAgo));
                r++;
            }
            tiers.add(new TierSnapshotDto(t.name(), prettyTierName(t), count, top));
        }
        return new LeaguesOverviewDto(rules, tiers);
    }

    private TierLeaderRowDto toTierLeaderRow(FreelancerGamificationProfile fp, int rank, Long viewerUserId, LocalDateTime since) {
        long followers = followRepo.countByFollowingUserId(fp.getUserId());
        boolean isFollowing = viewerUserId != null
                && !viewerUserId.equals(fp.getUserId())
                && followRepo.existsByFollowerUserIdAndFollowingUserId(viewerUserId, fp.getUserId());
        int enc = (int) encouragementRepo.countByToUserIdAndCreatedAtAfter(fp.getUserId(), since);
        return new TierLeaderRowDto(
                fp.getUserId(),
                fp.getWeeklyLeagueXp(),
                rank,
                displayNameOrDefault(fp),
                fp.getAvatarUrl(),
                fp.getLocation(),
                fp.getStreakDays(),
                fp.getLeagueTier().name(),
                followers,
                isFollowing,
                enc,
                fp.getPromotionsTotal(),
                fp.getDemotionsTotal()
        );
    }

    public String displayNameOrDefault(FreelancerGamificationProfile p) {
        if (p.getDisplayName() != null && !p.getDisplayName().isBlank()) {
            return p.getDisplayName().trim();
        }
        return "Freelancer #" + p.getUserId();
    }

    @Transactional
    public void updatePublicProfile(Long userId, UpdatePublicProfileDto dto) {
        FreelancerGamificationProfile p = getOrCreateProfile(userId);
        if (dto.getDisplayName() != null) {
            String dn = dto.getDisplayName().trim();
            if (dn.length() > 120) {
                dn = dn.substring(0, 120);
            }
            p.setDisplayName(dn.isEmpty() ? null : dn);
        }
        if (dto.getAvatarUrl() != null) {
            String av = dto.getAvatarUrl().trim();
            if (av.length() > 2000) {
                av = av.substring(0, 2000);
            }
            p.setAvatarUrl(av.isEmpty() ? null : av);
        }
        if (dto.getLocation() != null) {
            String loc = dto.getLocation().trim();
            if (loc.length() > 120) {
                loc = loc.substring(0, 120);
            }
            p.setLocation(loc.isEmpty() ? null : loc);
        }
        profileRepo.save(p);
    }

    @Transactional(readOnly = true)
    public LeaguePublicProfileDto getPublicProfile(Long targetUserId, Long viewerUserId) {
        FreelancerGamificationProfile p = getOrCreateProfile(targetUserId);
        long followers = followRepo.countByFollowingUserId(targetUserId);
        long following = followRepo.countByFollowerUserId(targetUserId);
        boolean viewerIsFollowing = viewerUserId != null
                && !viewerUserId.equals(targetUserId)
                && followRepo.existsByFollowerUserIdAndFollowingUserId(viewerUserId, targetUserId);
        return new LeaguePublicProfileDto(
                p.getUserId(),
                displayNameOrDefault(p),
                p.getAvatarUrl(),
                p.getLocation(),
                p.getStreakDays(),
                p.getLeagueTier().name(),
                p.getWeeklyLeagueXp(),
                p.getTotalPoints(),
                followers,
                following,
                p.getPromotionsTotal(),
                p.getDemotionsTotal(),
                List.of(),
                viewerIsFollowing
        );
    }

    @Transactional(readOnly = true)
    public List<FollowingUserDto> listFollowing(Long followerUserId) {
        List<LeagueFollow> links = followRepo.findByFollowerUserIdOrderByIdDesc(followerUserId);
        List<FollowingUserDto> out = new ArrayList<>();
        for (LeagueFollow f : links) {
            profileRepo.findByUserId(f.getFollowingUserId()).ifPresent(fp -> out.add(new FollowingUserDto(
                    fp.getUserId(),
                    displayNameOrDefault(fp),
                    fp.getAvatarUrl(),
                    fp.getLeagueTier().name(),
                    fp.getWeeklyLeagueXp(),
                    fp.getStreakDays(),
                    fp.getTotalPoints()
            )));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<FollowingUserDto> listFollowers(Long userId) {
        // Followers = users who follow `userId` (i.e. where following_user_id = userId)
        List<LeagueFollow> links = followRepo.findByFollowingUserIdOrderByIdDesc(userId);
        List<FollowingUserDto> out = new ArrayList<>();
        for (LeagueFollow f : links) {
            profileRepo.findByUserId(f.getFollowerUserId()).ifPresent(fp -> out.add(new FollowingUserDto(
                    fp.getUserId(),
                    displayNameOrDefault(fp),
                    fp.getAvatarUrl(),
                    fp.getLeagueTier().name(),
                    fp.getWeeklyLeagueXp(),
                    fp.getStreakDays(),
                    fp.getTotalPoints()
            )));
        }
        return out;
    }

    @Transactional
    public void follow(Long followerUserId, Long targetUserId) {
        if (followerUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        getOrCreateProfile(followerUserId);
        getOrCreateProfile(targetUserId);
        if (followRepo.existsByFollowerUserIdAndFollowingUserId(followerUserId, targetUserId)) {
            return;
        }
        followRepo.save(LeagueFollow.builder()
                .followerUserId(followerUserId)
                .followingUserId(targetUserId)
                .build());
    }

    @Transactional
    public void unfollow(Long followerUserId, Long targetUserId) {
        followRepo.deleteByFollowerUserIdAndFollowingUserId(followerUserId, targetUserId);
    }

    @Transactional
    public void postEncouragement(EncourageRequestDto dto) {
        if (dto.getFromUserId() == null || dto.getToUserId() == null) {
            throw new IllegalArgumentException("fromUserId and toUserId required");
        }
        if (dto.getFromUserId().equals(dto.getToUserId())) {
            throw new IllegalArgumentException("Cannot encourage yourself");
        }
        String msg = dto.getMessage() != null ? dto.getMessage().trim() : "";
        if (msg.length() > 1000) {
            msg = msg.substring(0, 1000);
        }
        if (msg.isEmpty()) {
            throw new IllegalArgumentException("Message required");
        }
        getOrCreateProfile(dto.getFromUserId());
        getOrCreateProfile(dto.getToUserId());
        LeagueEncouragement e = LeagueEncouragement.builder()
                .fromUserId(dto.getFromUserId())
                .toUserId(dto.getToUserId())
                .message(msg)
                .build();
        encouragementRepo.save(e);
    }

    @Transactional
    public void editEncouragement(Long encouragementId, Long userId, String newMessage) {
        if (newMessage == null) {
            throw new IllegalArgumentException("message required");
        }
        String msg = newMessage.trim();
        if (msg.isEmpty()) {
            throw new IllegalArgumentException("message required");
        }
        if (msg.length() > 1000) {
            msg = msg.substring(0, 1000);
        }

        LeagueEncouragement e = encouragementRepo.findById(encouragementId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!e.getFromUserId().equals(userId)) {
            throw new IllegalArgumentException("Cannot edit someone else's comment");
        }
        e.setMessage(msg);
        encouragementRepo.save(e);
    }

    @Transactional
    public void deleteEncouragement(Long encouragementId, Long userId) {
        LeagueEncouragement e = encouragementRepo.findById(encouragementId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!e.getFromUserId().equals(userId)) {
            throw new IllegalArgumentException("Cannot delete someone else's comment");
        }
        encouragementReactionRepo.deleteByEncouragementId(encouragementId);
        encouragementRepo.delete(e);
    }

    @Transactional(readOnly = true)
    public EncouragementPageDto listEncouragementsPaged(Long targetUserId, int page, int size, Long viewerUserId) {
        int s = Math.min(Math.max(size, 1), 50);
        int p = Math.max(page, 0);
        Pageable pg = PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LeagueEncouragement> res = encouragementRepo.findByToUserIdOrderByCreatedAtDesc(targetUserId, pg);
        List<LeagueEncouragement> chunk = res.getContent();
        if (chunk.isEmpty()) {
            return new EncouragementPageDto(
                    List.of(),
                    res.getNumber(),
                    res.getSize(),
                    res.getTotalElements(),
                    res.getTotalPages()
            );
        }
        List<Long> encIds = chunk.stream().map(LeagueEncouragement::getId).collect(Collectors.toList());
        List<LeagueEncouragementReaction> allReactions = encouragementReactionRepo.findByEncouragementIdIn(encIds);
        Map<Long, List<LeagueEncouragementReaction>> byEnc = allReactions.stream()
                .collect(Collectors.groupingBy(LeagueEncouragementReaction::getEncouragementId));
        List<EncouragementViewDto> content = chunk.stream()
                .map(e -> toEncouragementViewDto(e, byEnc.getOrDefault(e.getId(), List.of()), viewerUserId))
                .collect(Collectors.toList());
        return new EncouragementPageDto(
                content,
                res.getNumber(),
                res.getSize(),
                res.getTotalElements(),
                res.getTotalPages()
        );
    }

    private EncouragementViewDto toEncouragementViewDto(
            LeagueEncouragement e,
            List<LeagueEncouragementReaction> reactions,
            Long viewerUserId) {
        Map<String, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(LeagueEncouragementReaction::getEmoji, Collectors.counting()));
        List<ReactionCountDto> reactionsList = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(en -> new ReactionCountDto(en.getKey(), en.getValue()))
                .collect(Collectors.toList());
        String viewer = null;
        if (viewerUserId != null) {
            viewer = reactions.stream()
                    .filter(r -> viewerUserId.equals(r.getUserId()))
                    .map(LeagueEncouragementReaction::getEmoji)
                    .findFirst()
                    .orElse(null);
        }
        return new EncouragementViewDto(
                e.getId(),
                e.getFromUserId(),
                profileRepo.findByUserId(e.getFromUserId()).map(this::displayNameOrDefault).orElse("Player"),
                e.getMessage(),
                e.getCreatedAt().toString(),
                reactionsList,
                viewer
        );
    }

    @Transactional
    public void reactToEncouragement(Long encouragementId, Long userId, String emojiRaw) {
        encouragementRepo.findById(encouragementId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        Optional<LeagueEncouragementReaction> existing =
                encouragementReactionRepo.findByEncouragementIdAndUserId(encouragementId, userId);
        if (emojiRaw == null || emojiRaw.isBlank()) {
            existing.ifPresent(encouragementReactionRepo::delete);
            return;
        }
        String emoji = emojiRaw.trim();
        if (!ALLOWED_REACTION_EMOJI.contains(emoji)) {
            throw new IllegalArgumentException("Emoji not allowed");
        }
        if (existing.isPresent()) {
            LeagueEncouragementReaction r = existing.get();
            if (r.getEmoji().equals(emoji)) {
                encouragementReactionRepo.delete(r);
            } else {
                r.setEmoji(emoji);
                encouragementReactionRepo.save(r);
            }
        } else {
            encouragementReactionRepo.save(LeagueEncouragementReaction.builder()
                    .encouragementId(encouragementId)
                    .userId(userId)
                    .emoji(emoji)
                    .build());
        }
    }

    private void touchStreak(Long userId) {
        FreelancerGamificationProfile p = getOrCreateProfile(userId);
        LocalDate today = LocalDate.now();
        LocalDate last = p.getLastStreakActivityDate();
        if (last != null && last.equals(today)) {
            return;
        }
        if (last == null) {
            p.setStreakDays(1);
        } else if (last.equals(today.minusDays(1))) {
            p.setStreakDays(p.getStreakDays() + 1);
        } else {
            p.setStreakDays(1);
        }
        p.setLastStreakActivityDate(today);
        profileRepo.save(p);
    }

    private static LeagueRulesDto buildLeagueRules() {
        List<LeaguePrizeInfoDto> prizes = List.of(
                new LeaguePrizeInfoDto(1, "Weekly champion (your league)", 300,
                        "Badge WR1_<week> + points toward your career total"),
                new LeaguePrizeInfoDto(2, "Runner-up", 150, "Badge WR2_<week>"),
                new LeaguePrizeInfoDto(3, "Third place", 75, "Badge WR3_<week>")
        );
        return new LeagueRulesDto(
                "Each Monday, every league (Bronze → Diamond) runs a reset. You compete only against people in YOUR current league.",
                10,
                5,
                true,
                "Every Monday at 02:00 (server time). Weekly league XP resets to 0 after processing.",
                "Each week, the 10 freelancers with the highest weekly league XP in that league promote to the next tier "
                        + "(Bronze→Silver→Gold→Diamond). You must have earned at least 1 weekly XP to promote. "
                        + "There is no fixed point threshold — it is rank-based within your league.",
                "The 5 freelancers with the lowest weekly league XP in that league demote one tier "
                        + "(unless they were promoted the same week). Bronze is the floor; Diamond is the ceiling.",
                prizes
        );
    }

    private static String prettyTierName(LeagueTier t) {
        return switch (t) {
            case BRONZE -> "Bronze";
            case SILVER -> "Silver";
            case GOLD -> "Gold";
            case DIAMOND -> "Diamond";
        };
    }

    /**
     * Generates an avatar URL from an uploaded photo.
     * Current implementation is a photo-derived DiceBear avatar seed (working fallback).
     * If you later plug a real vision-to-avatar AI, this endpoint is the place to do it.
     */
    @Transactional(readOnly = true)
    public AvatarFromPhotoGenerateResponse generateAvatarFromPhoto(
            Long userId,
            String imageBase64,
            String mimeType,
            Integer styleIntensity,
            String genderPreference) {
        try {
            return aiAvatarService.generateAvatarFromPhoto(userId, imageBase64, mimeType, styleIntensity, genderPreference);
        } catch (Exception e) {
            // If AI fails, fall back to a deterministic DiceBear avatar seed.
            String seed = userId + "-photo-" + (imageBase64 != null ? imageBase64.length() : 0);
            String avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                    java.net.URLEncoder.encode(seed, java.nio.charset.StandardCharsets.UTF_8);
            return new AvatarFromPhotoGenerateResponse(
                    avatarUrl,
                    false,
                    "fallback",
                    "AI failed; generated deterministic fallback avatar."
            );
        }
    }

    @Transactional(readOnly = true)
    public WeeklyXpSeriesDto getWeeklyXpSeries(Long profileUserId, Long viewerUserId) {
        FreelancerGamificationProfile profile = getOrCreateProfile(profileUserId);
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        List<String> labels = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = start.plusDays(i);
            labels.add(d.getDayOfWeek().name().substring(0, 2));
        }

        List<Integer> profileSeries = toSeries(profileUserId, start, end);

        FreelancerGamificationProfile comparison = null;
        if (viewerUserId != null && !viewerUserId.equals(profileUserId)) {
            comparison = profileRepo.findByUserId(viewerUserId).orElseGet(() -> getOrCreateProfile(viewerUserId));
        }
        if (comparison == null) {
            comparison = profileRepo.findByLeagueTierOrderByWeeklyLeagueXpDesc(profile.getLeagueTier()).stream()
                    .filter(p -> !p.getUserId().equals(profileUserId))
                    .findFirst()
                    .orElse(null);
        }

        Long comparisonId = null;
        String comparisonName = null;
        List<Integer> comparisonSeries = List.of();
        if (comparison != null) {
            comparisonId = comparison.getUserId();
            comparisonName = displayNameOrDefault(comparison);
            comparisonSeries = toSeries(comparison.getUserId(), start, end);
        }

        return new WeeklyXpSeriesDto(
                profileUserId,
                displayNameOrDefault(profile),
                labels,
                profileSeries,
                comparisonId,
                comparisonName,
                comparisonSeries
        );
    }

    private List<Integer> toSeries(Long userId, LocalDate start, LocalDate end) {
        Map<LocalDate, Integer> byDay = xpDailyStatRepo.findByUserIdAndStatDateBetweenOrderByStatDateAsc(userId, start, end).stream()
                .collect(Collectors.toMap(LeagueXpDailyStat::getStatDate, LeagueXpDailyStat::getLeagueXpEarned, Integer::sum));
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = start.plusDays(i);
            out.add(byDay.getOrDefault(d, 0));
        }
        return out;
    }

    /**
     * Before promotions: in each league, top 3 by weekly XP get bonus career points + a dated badge (if weekly XP is positive).
     */
    private void awardWeeklyTopThreePrizes() {
        LocalDate weekKey = mondayThisWeek();
        String suffix = weekKey.toString();
        int[] points = {300, 150, 75};
        String[] badgePrefixes = {"WR1_", "WR2_", "WR3_"};
        for (LeagueTier tier : LeagueTier.values()) {
            List<FreelancerGamificationProfile> list = profileRepo.findByLeagueTierOrderByWeeklyLeagueXpDesc(tier);
            for (int i = 0; i < Math.min(3, list.size()); i++) {
                FreelancerGamificationProfile p = list.get(i);
                if (p.getWeeklyLeagueXp() <= 0) {
                    continue;
                }
                p.setTotalPoints(p.getTotalPoints() + points[i]);
                String badge = badgePrefixes[i] + suffix;
                p.getBadges().add(badge);
                profileRepo.save(p);
            }
        }
    }

    private void bumpChallenge(Long userId, String code, int delta) {
        challengeRepo.findByUserIdAndChallengeDateAndChallengeCode(userId, LocalDate.now(), code)
                .ifPresent(c -> {
                    if (c.isCompleted()) {
                        return;
                    }
                    c.setCurrentCount(Math.min(c.getTargetCount(), c.getCurrentCount() + delta));
                    challengeRepo.save(c);
                    tryCompleteChallenge(c);
                });
    }

    private void tryCompleteChallenge(DailyChallengeProgress c) {
        if (c.isCompleted() || c.getCurrentCount() < c.getTargetCount()) {
            return;
        }
        c.setCompleted(true);
        challengeRepo.save(c);

        FreelancerGamificationProfile p = getOrCreateProfile(c.getUserId());
        int base = c.getPointsReward();
        int pts = applySubscriberMultiplier(p, base);
        p.setTotalPoints(p.getTotalPoints() + pts);
        p.setWeeklyLeagueXp(p.getWeeklyLeagueXp() + pts);
        bumpDailyXp(c.getUserId(), pts);

        if (p.getTotalPoints() >= 500) {
            p.getBadges().add("POINTS_500");
        }
        profileRepo.save(p);
        touchStreak(c.getUserId());

        maybeAwardDailyTriad(c.getUserId());
    }

    private void bumpDailyXp(Long userId, int delta) {
        if (delta <= 0) {
            return;
        }
        LocalDate today = LocalDate.now();
        LeagueXpDailyStat stat = xpDailyStatRepo.findByUserIdAndStatDate(userId, today)
                .orElseGet(() -> LeagueXpDailyStat.builder()
                        .userId(userId)
                        .statDate(today)
                        .leagueXpEarned(0)
                        .build());
        stat.setLeagueXpEarned(stat.getLeagueXpEarned() + delta);
        xpDailyStatRepo.save(stat);
    }

    private int applySubscriberMultiplier(FreelancerGamificationProfile p, int base) {
        if (Boolean.TRUE.equals(p.getActiveSubscriber())) {
            return (int) Math.round(base * 1.25);
        }
        return base;
    }

    private void maybeAwardDailyTriad(Long userId) {
        List<DailyChallengeProgress> list = challengeRepo.findByUserIdAndChallengeDateOrderByIdAsc(userId, LocalDate.now());
        boolean all = list.stream().filter(x -> List.of(CODE_APPLY, CODE_PROFILE, CODE_PASS_TEST).contains(x.getChallengeCode()))
                .allMatch(DailyChallengeProgress::isCompleted);
        if (all && list.size() >= 3) {
            FreelancerGamificationProfile p = profileRepo.findByUserId(userId).orElse(null);
            if (p != null && !p.getBadges().contains("DAILY_TRIAD")) {
                p.getBadges().add("DAILY_TRIAD");
                profileRepo.save(p);
            }
        }
    }

    /** Weekly reset: podium prizes, then top 10 promote / bottom 5 demote, then zero weekly XP. */
    @Transactional
    public void runWeeklyLeagueCycle() {
        awardWeeklyTopThreePrizes();
        LocalDate newMonday = mondayThisWeek();
        for (LeagueTier tier : LeagueTier.values()) {
            List<FreelancerGamificationProfile> list = new ArrayList<>(
                    profileRepo.findByLeagueTierOrderByWeeklyLeagueXpDesc(tier));
            int n = list.size();
            Set<Long> promoted = new HashSet<>();
            int top = Math.min(10, n);
            for (int i = 0; i < top; i++) {
                FreelancerGamificationProfile p = list.get(i);
                if (p.getWeeklyLeagueXp() <= 0) {
                    continue;
                }
                if (p.getLeagueTier() == LeagueTier.DIAMOND) {
                    continue;
                }
                p.setPromotionsTotal(p.getPromotionsTotal() + 1);
                p.setLeagueTier(nextTier(p.getLeagueTier()));
                promoted.add(p.getUserId());
            }
            for (int i = Math.max(0, n - 5); i < n; i++) {
                FreelancerGamificationProfile p = list.get(i);
                if (promoted.contains(p.getUserId())) {
                    continue;
                }
                if (p.getLeagueTier() == LeagueTier.BRONZE) {
                    continue;
                }
                p.setDemotionsTotal(p.getDemotionsTotal() + 1);
                p.setLeagueTier(prevTier(p.getLeagueTier()));
            }
        }
        List<FreelancerGamificationProfile> all = profileRepo.findAll();
        for (FreelancerGamificationProfile p : all) {
            p.setWeeklyLeagueXp(0);
            p.setLeagueWeekStartMonday(newMonday);
            profileRepo.save(p);
        }
    }

    private static LeagueTier nextTier(LeagueTier t) {
        return switch (t) {
            case BRONZE -> LeagueTier.SILVER;
            case SILVER -> LeagueTier.GOLD;
            case GOLD, DIAMOND -> LeagueTier.DIAMOND;
        };
    }

    private static LeagueTier prevTier(LeagueTier t) {
        return switch (t) {
            case DIAMOND -> LeagueTier.GOLD;
            case GOLD -> LeagueTier.SILVER;
            case SILVER, BRONZE -> LeagueTier.BRONZE;
        };
    }
}
