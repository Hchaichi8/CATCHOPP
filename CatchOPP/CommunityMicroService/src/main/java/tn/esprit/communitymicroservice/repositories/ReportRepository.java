package tn.esprit.communitymicroservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.communitymicroservice.entities.Report;
import tn.esprit.communitymicroservice.entities.ReportStatus;
import tn.esprit.communitymicroservice.entities.ReportTargetType;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // All reports with a given status (e.g. PENDING)
    List<Report> findByStatus(ReportStatus status);

    // All reports targeting a specific post or comment
    List<Report> findByTargetTypeAndTargetId(ReportTargetType targetType, Long targetId);

    // All reports submitted by a user
    List<Report> findByReporterId(Long reporterId);

    // Check if a user already reported a specific target
    boolean existsByReporterIdAndTargetTypeAndTargetId(
            Long reporterId, ReportTargetType targetType, Long targetId);
}
