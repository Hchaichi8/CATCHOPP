package org.example.ms_competenceandreview.Services.Impl;

import org.example.ms_competenceandreview.Entities.Competance;
import org.example.ms_competenceandreview.Repositories.CompetanceRepo;
import org.example.ms_competenceandreview.Services.Interface.CompetanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompetanceServiceImpl implements CompetanceService {
    @Autowired
    CompetanceRepo  competanceRepo;

    @Override
    public Competance AjouterCompetance(Competance competance) {
        return competanceRepo.save(competance);
    }

    @Override
    public Competance ModifierCompetance(Competance competance) {
        return competanceRepo.save(competance);
    }

    @Override

    public void SupprimerCompetance(Long id) {
        competanceRepo.deleteById(id);

    }

    @Override
    public Competance GetCompetance(Long id) {
        return competanceRepo.findById(id).orElseThrow();
    }

    @Override
    public List<Competance> GetAllCompetance() {
        return competanceRepo.findAll();
    }
}
