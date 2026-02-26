package org.example.projectmicroservice.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;
    private String ExperienceLevel;
    private Double budget;
    private LocalDate postedAt;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Column(columnDefinition = "integer default 0")
    private int likes = 0;
    @Enumerated(EnumType.STRING)
    private ProjectCategory category;
    @Enumerated(EnumType.STRING)
    private JobType jobType;
    @ElementCollection
    @CollectionTable(name = "project_competences", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "competence_id")
    private List<Long> requiredCompetenceIds;

    public List<Long> getRequiredCompetenceIds() {
        return requiredCompetenceIds;
    }

    public void setRequiredCompetenceIds(List<Long> requiredCompetenceIds) {
        this.requiredCompetenceIds = requiredCompetenceIds;
    }

    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }


    public ProjectCategory getCategory() {
        return category;
    }

    public void setCategory(ProjectCategory category) {
        this.category = category;
    }

    public int getLoves() {
        return loves;
    }

    public void setLoves(int loves) {
        this.loves = loves;
    }

    public int getHahas() {
        return hahas;
    }

    public void setHahas(int hahas) {
        this.hahas = hahas;
    }

    public int getSupports() {
        return supports;
    }

    public void setSupports(int supports) {
        this.supports = supports;
    }

    @Column(columnDefinition = "integer default 0")
    private int loves = 0;

    @Column(columnDefinition = "integer default 0")
    private int hahas = 0;

    @Column(columnDefinition = "integer default 0")
    private int supports = 0;
    private Long clientId;

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Proposal> proposals;


    public List<Proposal> getProposals() {
        return proposals;
    }

    public void setProposals(List<Proposal> proposals) {
        this.proposals = proposals;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDate postedAt) {
        this.postedAt = postedAt;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public String getExperienceLevel() {
        return ExperienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        ExperienceLevel = experienceLevel;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
