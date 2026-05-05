package tn.esprit.communitymicroservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.communitymicroservice.entities.Report;
import tn.esprit.communitymicroservice.entities.ReportTargetType;
import tn.esprit.communitymicroservice.services.ReportService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // POST /api/reports
    // Body: { "reporterId": 1, "targetType": "POST", "targetId": 5, "reason": "Spam" }
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Map<String, Object> body) {
        try {
            Long reporterId  = Long.valueOf(body.get("reporterId").toString());
            String typeStr   = body.get("targetType").toString();
            Long targetId    = Long.valueOf(body.get("targetId").toString());
            String reason    = body.get("reason").toString();

            ReportTargetType targetType = ReportTargetType.valueOf(typeStr.toUpperCase());
            Report report = reportService.createReport(reporterId, targetType, targetId, reason);
            return ResponseEntity.status(HttpStatus.CREATED).body(report);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid targetType. Use POST or COMMENT.");
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already reported")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/reports
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    // GET /api/reports/pending
    @GetMapping("/pending")
    public ResponseEntity<List<Report>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    // GET /api/reports/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reportService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/reports/target?type=POST&targetId=5
    @GetMapping("/target")
    public ResponseEntity<List<Report>> getByTarget(
            @RequestParam String type,
            @RequestParam Long targetId) {
        try {
            ReportTargetType targetType = ReportTargetType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(reportService.getReportsByTarget(targetType, targetId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/reports/reporter/{reporterId}
    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<Report>> getByReporter(@PathVariable Long reporterId) {
        return ResponseEntity.ok(reportService.getReportsByReporter(reporterId));
    }

    // PUT /api/reports/{id}/dismiss
    @PutMapping("/{id}/dismiss")
    public ResponseEntity<?> dismiss(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reportService.dismissReport(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/reports/{id}/delete-content
    @DeleteMapping("/{id}/delete-content")
    public ResponseEntity<?> deleteContent(@PathVariable Long id) {
        try {
            reportService.deleteReportedContent(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
