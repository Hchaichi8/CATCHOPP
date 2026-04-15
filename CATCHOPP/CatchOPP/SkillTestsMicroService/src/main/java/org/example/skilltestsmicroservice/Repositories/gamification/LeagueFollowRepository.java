package org.example.skilltestsmicroservice.Repositories.gamification;

import org.example.skilltestsmicroservice.Entities.gamification.LeagueFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueFollowRepository extends JpaRepository<LeagueFollow, Long> {

    long countByFollowingUserId(Long followingUserId);

    long countByFollowerUserId(Long followerUserId);

    boolean existsByFollowerUserIdAndFollowingUserId(Long followerUserId, Long followingUserId);

    Optional<LeagueFollow> findByFollowerUserIdAndFollowingUserId(Long followerUserId, Long followingUserId);

    void deleteByFollowerUserIdAndFollowingUserId(Long followerUserId, Long followingUserId);

    List<LeagueFollow> findByFollowerUserIdOrderByIdDesc(Long followerUserId);

    List<LeagueFollow> findByFollowingUserIdOrderByIdDesc(Long followingUserId);
}
