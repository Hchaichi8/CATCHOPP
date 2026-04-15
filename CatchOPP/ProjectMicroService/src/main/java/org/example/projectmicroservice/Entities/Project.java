package org.example.projectmicroservice.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    private String ExperienceLevel;

    private Double budget;

    private LocalDate postedAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private ProjectCategory category;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    private Long clientId;

    // Fixed: Changed from int to Integer and kept defaults
    @Column(columnDefinition = "integer default 0")
    private Integer likes = 0;

    @Column(columnDefinition = "integer default 0")
    private Integer loves = 0;

    @Column(columnDefinition = "integer default 0")
    private Integer hahas = 0;

    @Column(columnDefinition = "integer default 0")
    private Integer supports = 0;

    @ElementCollection
    @CollectionTable(name = "project_competences", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "competence_id")
    private List<Long> requiredCompetenceIds;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Proposal> proposals;

    /**
     * Helper methods to ensure we never return null to the frontend
     * even if the database has NULL values.
     */
    public Integer getLikes() { return likes == null ? 0 : likes; }
    public Integer getLoves() { return loves == null ? 0 : loves; }
    public Integer getHahas() { return hahas == null ? 0 : hahas; }
    public Integer getSupports() { return supports == null ? 0 : supports; }
}