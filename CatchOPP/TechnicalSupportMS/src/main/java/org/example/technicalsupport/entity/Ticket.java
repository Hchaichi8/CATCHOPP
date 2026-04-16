package org.example.technicalsupport.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userEmail;
    private String userName;
    private String title;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String enhancedDescription;   // TextRazor enhanced version

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String aiSummary;             // Hugging Face BART summary

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    private TicketCategory category;

    private String department;
    private Long assignedToId;
    private String assignedToName;
    private boolean escalated = false;
    private boolean slaBreached = false;

    // Store as String in JSON to avoid Jackson 3 LocalDateTime issues
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    // Expose as ISO strings for frontend
    public String getCreatedAtStr()  { return createdAt  != null ? createdAt.format(FMT)  : null; }
    public String getUpdatedAtStr()  { return updatedAt  != null ? updatedAt.format(FMT)  : null; }
    public String getResolvedAtStr() { return resolvedAt != null ? resolvedAt.format(FMT) : null; }
    public String getSlaDeadlineStr(){ return slaDeadline!= null ? slaDeadline.format(FMT): null; }

    @JsonIgnore
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<TicketResponse> responses = new java.util.ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<TicketAttachment> attachments = new java.util.ArrayList<>();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
