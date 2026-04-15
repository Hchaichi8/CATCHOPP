package org.example.skilltestsmicroservice.Entities.gamification;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "league_follows",
        uniqueConstraints = @UniqueConstraint(columnNames = {"follower_user_id", "following_user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeagueFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "follower_user_id", nullable = false)
    private Long followerUserId;

    @Column(name = "following_user_id", nullable = false)
    private Long followingUserId;
}
