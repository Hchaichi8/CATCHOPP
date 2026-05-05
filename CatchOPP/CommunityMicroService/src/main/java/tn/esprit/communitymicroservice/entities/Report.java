package tn.esprit.communitymicroservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who submitted the report
    @Column(nullable = false)
    private Long reporterId;

    // What is being reported: POST or COMMENT
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportTargetType targetType;

    // ID of the reported post or comment
    @Column(nullable = false)
    private Long targetId;

    // Reason provided by the reporter
    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    // Admin review status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = ReportStatus.PENDING;
    }
}
