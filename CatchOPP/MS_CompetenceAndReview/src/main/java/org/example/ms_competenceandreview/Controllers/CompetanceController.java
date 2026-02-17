package org.example.ms_competenceandreview.Controllers;

import org.example.ms_competenceandreview.Entities.Competance;
import org.example.ms_competenceandreview.Services.Interface.CompetanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/competance")
public class CompetanceController {
    @Autowired
    private final CompetanceService competanceService;

    public CompetanceController(CompetanceService competanceService) {
        this.competanceService = competanceService;
    }
    @PostMapping("/AjouterCompetance")
    public Competance AjouterCompetance(@RequestBody Competance a) {return competanceService.AjouterCompetance(a);}
    @PostMapping("/ModifierCompetance")
    public Competance ModifierCompetance(@RequestBody Competance a) {return competanceService.ModifierCompetance(a);}
    @DeleteMapping("/SupprimerCompetance/{id}")
    public void SupprimerCompetance(@RequestBody Long id) {competanceService.SupprimerCompetance(id);}
    @GetMapping("/GetCompetance/{id}")
    public Competance GetCompetance(@RequestBody Long id) {return competanceService.GetCompetance(id);}
    @GetMapping("/GetAllCompetance")
    public List<Competance> GetAllCompetance() {return competanceService.GetAllCompetance();}



}
