package org.example.referralmicroservice.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "referral_rewards")
@Data
public class ReferralReward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long referralId;
    private Long userId;  // referrer who receives the reward
    private String rewardType;  // CREDIT, DISCOUNT, SUBSCRIPTION_MONTH
    private Double amount;  // credits or discount value
    private Boolean claimed = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
