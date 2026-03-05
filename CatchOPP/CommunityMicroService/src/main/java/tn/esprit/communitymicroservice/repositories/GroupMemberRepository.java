package tn.esprit.communitymicroservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.communitymicroservice.entities.GroupMember;

import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByUserId(Long userId);
    Long countByGroupId(Long groupId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM GroupMember gm WHERE gm.group.id = :groupId")
    void deleteByGroupId(@Param("groupId") Long groupId);
}
