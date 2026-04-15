package org.example.skilltestsmicroservice.Entities.gamification;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "league_encouragement_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"encouragement_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeagueEncouragementReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encouragement_id", nullable = false)
    private Long encouragementId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Single grapheme / emoji (whitelisted in service). */
    @Column(nullable = false, length = 16)
    private String emoji;
}
