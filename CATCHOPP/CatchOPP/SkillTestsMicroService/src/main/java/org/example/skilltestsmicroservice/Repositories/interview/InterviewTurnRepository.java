package org.example.skilltestsmicroservice.Repositories.interview;

import org.example.skilltestsmicroservice.Entities.interview.InterviewTurn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewTurnRepository extends JpaRepository<InterviewTurn, Long> {
    List<InterviewTurn> findBySessionIdOrderByQuestionIndexAsc(Long sessionId);
}
