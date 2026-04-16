package org.example.technicalsupport.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "ticket_responses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketResponse {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    private Long responderId;
    private String responderName;
    private boolean isStaff;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public String getCreatedAtStr() { return createdAt != null ? createdAt.format(FMT) : null; }

    // Explicit getter/setter for isStaff to avoid Lombok naming issues
    public boolean isStaff() { return isStaff; }
    public void setStaff(boolean staff) { isStaff = staff; }
}
