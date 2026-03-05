package tn.esprit.communitymicroservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.communitymicroservice.entities.GroupMember;
import tn.esprit.communitymicroservice.repositories.GroupMemberRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupMemberService {
    @Autowired
    private GroupMemberRepository groupMemberRepository;

    public GroupMember addMember(GroupMember member) {
        member.setJoinedAt(LocalDateTime.now());
        return groupMemberRepository.save(member);
    }

    public List<GroupMember> getAllMembers() {
        return groupMemberRepository.findAll();
    }

    public GroupMember getMemberById(Long id) {
        return groupMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
    }

    public List<GroupMember> getMembersByGroupId(Long groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }

    public List<GroupMember> getMembersByUserId(Long userId) {
        return groupMemberRepository.findByUserId(userId);
    }

    public GroupMember updateMemberRole(Long id, GroupMember updated) {
        GroupMember member = getMemberById(id);
        member.setRole(updated.getRole());
        return groupMemberRepository.save(member);
    }

    public void removeMember(Long id) {
        groupMemberRepository.deleteById(id);
    }

    public Long countMembersByGroupId(Long groupId) {
        return groupMemberRepository.countByGroupId(groupId);
    }
}
