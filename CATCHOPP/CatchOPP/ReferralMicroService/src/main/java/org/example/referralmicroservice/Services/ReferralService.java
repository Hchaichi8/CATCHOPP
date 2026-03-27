package org.example.referralmicroservice.Services;

import org.example.referralmicroservice.Entities.Referral;
import org.example.referralmicroservice.Entities.ReferralCode;
import org.example.referralmicroservice.Entities.ReferralReward;
import org.example.referralmicroservice.Repositories.ReferralCodeRepository;
import org.example.referralmicroservice.Repositories.ReferralRepository;
import org.example.referralmicroservice.Repositories.ReferralRewardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReferralService {

    @Autowired
    private ReferralRepository referralRepo;

    @Autowired
    private ReferralCodeRepository codeRepo;

    @Autowired
    private ReferralRewardRepository rewardRepo;

    public String getOrCreateReferralCode(Long userId) {
        return codeRepo.findByUserId(userId)
                .map(ReferralCode::getCode)
                .orElseGet(() -> {
                    String code = "CATCH-" + userId + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                    ReferralCode rc = new ReferralCode();
                    rc.setUserId(userId);
                    rc.setCode(code);
                    return codeRepo.save(rc).getCode();
                });
    }

    public ReferralCode createReferralCode(ReferralCode rc) {
        return codeRepo.save(rc);
    }

    public ReferralCode getReferralCodeById(Long id) {
        return codeRepo.findById(id).orElseThrow(() -> new RuntimeException("ReferralCode not found"));
    }

    public ReferralCode updateReferralCode(Long id, ReferralCode updates) {
        ReferralCode existing = getReferralCodeById(id);
        if (updates.getUserId() != null) existing.setUserId(updates.getUserId());
        if (updates.getCode() != null) existing.setCode(updates.getCode());
        return codeRepo.save(existing);
    }

    public void deleteReferralCode(Long id) {
        codeRepo.deleteById(id);
    }

    public List<ReferralCode> getAllReferralCodes() {
        return codeRepo.findAll();
    }

    public Referral createReferral(String code, Long referredUserId) {
        ReferralCode rc = codeRepo.findByCode(code).orElseThrow(() -> new RuntimeException("Invalid referral code"));
        Referral r = new Referral();
        r.setReferrerUserId(rc.getUserId());
        r.setReferredUserId(referredUserId);
        r.setReferralCode(code);
        r.setReferralCodeRef(rc);
        r.setStatus("COMPLETED");
        return referralRepo.save(r);
    }

    public Referral getReferralById(Long id) {
        return referralRepo.findById(id).orElseThrow(() -> new RuntimeException("Referral not found"));
    }

    public Referral updateReferral(Long id, Referral updates) {
        Referral existing = getReferralById(id);
        if (updates.getReferrerUserId() != null) existing.setReferrerUserId(updates.getReferrerUserId());
        if (updates.getReferredUserId() != null) existing.setReferredUserId(updates.getReferredUserId());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        return referralRepo.save(existing);
    }

    public void deleteReferral(Long id) {
        referralRepo.deleteById(id);
    }

    public List<Referral> getAllReferrals() {
        return referralRepo.findAll();
    }

    public ReferralReward createReferralReward(Long referralId, Long userId, String rewardType, Double amount) {
        Referral referral = getReferralById(referralId);
        ReferralReward rw = new ReferralReward();
        rw.setReferral(referral);
        rw.setUserId(userId);
        rw.setRewardType(rewardType);
        rw.setAmount(amount);
        return rewardRepo.save(rw);
    }

    public ReferralReward getReferralRewardById(Long id) {
        return rewardRepo.findById(id).orElseThrow(() -> new RuntimeException("ReferralReward not found"));
    }

    public ReferralReward updateReferralReward(Long id, ReferralReward updates) {
        ReferralReward existing = getReferralRewardById(id);
        if (updates.getUserId() != null) existing.setUserId(updates.getUserId());
        if (updates.getRewardType() != null) existing.setRewardType(updates.getRewardType());
        if (updates.getAmount() != null) existing.setAmount(updates.getAmount());
        if (updates.getClaimed() != null) existing.setClaimed(updates.getClaimed());
        return rewardRepo.save(existing);
    }

    public void deleteReferralReward(Long id) {
        rewardRepo.deleteById(id);
    }

    public List<ReferralReward> getAllReferralRewards() {
        return rewardRepo.findAll();
    }

    public List<Referral> getReferralsByUser(Long userId) {
        return referralRepo.findByReferrerUserId(userId);
    }

    public List<ReferralReward> getUserRewards(Long userId) {
        return rewardRepo.findByUserId(userId);
    }

    public double getTotalEarned(Long userId) {
        return rewardRepo.findByUserId(userId).stream()
                .filter(ReferralReward::getClaimed)
                .mapToDouble(r -> r.getAmount() != null ? r.getAmount() : 0)
                .sum();
    }
}
