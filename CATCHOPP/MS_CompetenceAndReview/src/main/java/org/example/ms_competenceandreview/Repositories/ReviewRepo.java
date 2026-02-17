package org.example.ms_competenceandreview.Repositories;

import org.example.ms_competenceandreview.Entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {
}
