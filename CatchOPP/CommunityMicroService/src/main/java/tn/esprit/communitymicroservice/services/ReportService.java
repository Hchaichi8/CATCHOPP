package tn.esprit.communitymicroservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.communitymicroservice.entities.*;
import tn.esprit.communitymicroservice.repositories.CommentRepository;
import tn.esprit.communitymicroservice.repositories.PostRepository;
import tn.esprit.communitymicroservice.repositories.ReportRepository;

import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    // ── Create a report ───────────────────────────────────────────────────
    public Report createReport(Long reporterId, ReportTargetType targetType,
                               Long targetId, String reason) {

        // Validate target exists
        if (targetType == ReportTargetType.POST) {
            postRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Post not found: " + targetId));
        } else if (targetType == ReportTargetType.COMMENT) {
            commentRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Comment not found: " + targetId));
        }

        // Prevent duplicate reports from the same user on the same target
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId, targetType, targetId)) {
            throw new RuntimeException("You have already reported this content.");
        }

        Report report = new Report();
        report.setReporterId(reporterId);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setStatus(ReportStatus.PENDING);
        return reportRepository.save(report);
    }

    // ── Get all reports ───────────────────────────────────────────────────
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // ── Get pending reports ───────────────────────────────────────────────
    public List<Report> getPendingReports() {
        return reportRepository.findByStatus(ReportStatus.PENDING);
    }

    // ── Get reports by target ─────────────────────────────────────────────
    public List<Report> getReportsByTarget(ReportTargetType targetType, Long targetId) {
        return reportRepository.findByTargetTypeAndTargetId(targetType, targetId);
    }

    // ── Get reports by reporter ───────────────────────────────────────────
    public List<Report> getReportsByReporter(Long reporterId) {
        return reportRepository.findByReporterId(reporterId);
    }

    // ── Dismiss a report (admin) ──────────────────────────────────────────
    public Report dismissReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
        report.setStatus(ReportStatus.DISMISSED);
        return reportRepository.save(report);
    }

    // ── Delete reported content + mark report as REVIEWED (admin) ─────────
    public void deleteReportedContent(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        // Delete the actual content
        if (report.getTargetType() == ReportTargetType.POST) {
            postRepository.deleteById(report.getTargetId());
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            commentRepository.deleteById(report.getTargetId());
        }

        // Mark all reports on this target as REVIEWED
        List<Report> relatedReports = reportRepository.findByTargetTypeAndTargetId(
                report.getTargetType(), report.getTargetId());
        relatedReports.forEach(r -> r.setStatus(ReportStatus.REVIEWED));
        reportRepository.saveAll(relatedReports);
    }

    // ── Get report by ID ──────────────────────────────────────────────────
    public Report getById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found: " + id));
    }
}
