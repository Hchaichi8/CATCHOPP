package org.example.ms_competenceandreview.Services.Impl;

import org.example.ms_competenceandreview.Entities.Review;
import org.example.ms_competenceandreview.Repositories.CompetanceRepo;
import org.example.ms_competenceandreview.Repositories.ReviewRepo;
import org.example.ms_competenceandreview.Services.Interface.CompetanceService;
import org.example.ms_competenceandreview.Services.Interface.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {
    @Autowired
    ReviewRepo reviewRepo;

    @Override
    public Review AjouterReview(Review review) {
        return reviewRepo.save(review);

    }

    @Override
    public Review ModifierReview(Review review) {
        return reviewRepo.save(review);
    }

    @Override
    public void SupprimerReview(Long id) {
        reviewRepo.deleteById(id);


    }

    @Override
    public Review GetReview(Long id) {
        return reviewRepo.findById(id).orElseThrow();
    }

    @Override
    public List<Review> GetAllReview() {
        return reviewRepo.findAll();
    }
}
