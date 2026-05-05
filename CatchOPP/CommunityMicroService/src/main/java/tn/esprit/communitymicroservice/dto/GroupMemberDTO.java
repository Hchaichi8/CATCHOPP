package tn.esprit.communitymicroservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.communitymicroservice.entities.Role;

import java.time.LocalDateTime;

/**
 * GroupMember enriched with user info fetched from UserMicroService.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupMemberDTO {

    private Long id;
    private Long groupId;
    private Role role;
    private LocalDateTime joinedAt;

    // User info from UserMicroService
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePictureUrl;

    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}
