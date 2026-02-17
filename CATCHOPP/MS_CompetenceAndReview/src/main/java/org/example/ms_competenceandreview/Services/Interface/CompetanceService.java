package org.example.ms_competenceandreview.Services.Interface;

import org.example.ms_competenceandreview.Entities.Competance;

import java.util.List;

public interface CompetanceService {
    Competance AjouterCompetance(Competance competance);
    Competance ModifierCompetance(Competance competance);
    void SupprimerCompetance(Long id);
    Competance GetCompetance(Long id);
    List<Competance> GetAllCompetance();
}
