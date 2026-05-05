package tn.esprit.communitymicroservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.communitymicroservice.config.UserClient;
import tn.esprit.communitymicroservice.dto.GroupMemberDTO;
import tn.esprit.communitymicroservice.dto.UserDTO;
import tn.esprit.communitymicroservice.entities.GroupMember;
import tn.esprit.communitymicroservice.services.GroupMemberService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/group-members")
public class GroupMemberController {

    @Autowired
    private GroupMemberService groupMemberService;

    @Autowired
    private UserClient userClient;

    @PostMapping
    public GroupMember addMember(@RequestBody GroupMember member) {
        return groupMemberService.addMember(member);
    }

    @GetMapping
    public List<GroupMember> getAllMembers() {
        return groupMemberService.getAllMembers();
    }

    @GetMapping("/{id}")
    public GroupMember getMemberById(@PathVariable Long id) {
        return groupMemberService.getMemberById(id);
    }

    @GetMapping("/group/{groupId}")
    public List<GroupMember> getMembersByGroupId(@PathVariable Long groupId) {
        return groupMemberService.getMembersByGroupId(groupId);
    }

    // GET /api/group-members/group/{groupId}/enriched
    // Returns members with user info (firstName, lastName, profilePicture...)
    @GetMapping("/group/{groupId}/enriched")
    public List<GroupMemberDTO> getEnrichedMembersByGroupId(@PathVariable Long groupId) {
        List<GroupMember> members = groupMemberService.getMembersByGroupId(groupId);

        return members.stream().map(member -> {
            GroupMemberDTO dto = new GroupMemberDTO();
            dto.setId(member.getId());
            dto.setGroupId(member.getGroup() != null ? member.getGroup().getId() : null);
            dto.setUserId(member.getUserId());
            dto.setRole(member.getRole());
            dto.setJoinedAt(member.getJoinedAt());

            // Fetch user info from UserMicroService via Feign
            try {
                UserDTO user = userClient.getUserById(member.getUserId());
                if (user != null) {
                    dto.setFirstName(user.getFirstName());
                    dto.setLastName(user.getLastName());
                    dto.setEmail(user.getEmail());
                    dto.setProfilePictureUrl(user.getProfilePictureUrl());
                }
            } catch (Exception e) {
                // UserMicroService unavailable — return member without user info
                System.err.println("Could not fetch user " + member.getUserId() + ": " + e.getMessage());
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public List<GroupMember> getMembersByUserId(@PathVariable Long userId) {
        return groupMemberService.getMembersByUserId(userId);
    }

    @PutMapping("/{id}")
    public GroupMember updateMemberRole(@PathVariable Long id, @RequestBody GroupMember member) {
        return groupMemberService.updateMemberRole(id, member);
    }

    @DeleteMapping("/{id}")
    public void removeMember(@PathVariable Long id) {
        groupMemberService.removeMember(id);
    }

    @GetMapping("/group/{groupId}/count")
    public Long countMembersByGroupId(@PathVariable Long groupId) {
        return groupMemberService.countMembersByGroupId(groupId);
    }
}
