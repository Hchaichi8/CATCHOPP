package org.example.ms_competenceandreview.Services.Impl;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.example.ms_competenceandreview.Entities.Competance;
import org.example.ms_competenceandreview.Repositories.CompetanceRepo;
import org.example.ms_competenceandreview.Services.Interface.CompetanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class CompetanceServiceImpl implements CompetanceService {
    @Autowired
    CompetanceRepo  competanceRepo;

    @Override
    public Competance AjouterCompetance(Competance competance) {
        System.out.println("   -> [SERVICE] Tentative de sauvegarde dans MySQL...");
        try {
            Competance result = competanceRepo.save(competance);
            System.out.println("   -> [SERVICE] Sauvegarde MySQL réussie avec ID : " + result.getId());
            return result;
        } catch (Exception e) {
            System.err.println("   -> [SERVICE-CRASH] MySQL a refusé la sauvegarde !");
            throw e; // On renvoie l'erreur au contrôleur
        }
    }

    @Override
    public List<Competance> GetAllCompetance() {
        System.out.println("   -> [SERVICE] Lecture de la table MySQL...");
        try {
            return competanceRepo.findAll();
        } catch (Exception e) {
            System.err.println("   -> [SERVICE-CRASH] MySQL a refusé la lecture !");
            throw e;
        }
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
    public List<Competance> ParseCVAndMatchSkills(MultipartFile file) {
        List<Competance> matchedSkills = new ArrayList<>();

        try {
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper pdfStripper = new PDFTextStripper();

            // 1. Extraire le texte du CV en minuscules
            String cvText = pdfStripper.getText(document).toLowerCase();
            document.close();

            // 2. 🟢 CORRECTION ICI : Remplacer "1" par "5" (ou enlever le filtre si tu veux TOUTES les compétences)
            List<Competance> allMasterSkills = competanceRepo.findAll()
                    .stream()
                    .filter(c -> "5".equals(c.getUserId())) // <-- Remplacé par 5 pour correspondre à Angular
                    .toList();

            // 3. Comparer avec le texte du CV
            for (Competance skill : allMasterSkills) {
                // On nettoie les espaces invisibles avec .trim()
                String skillName = skill.getNom().trim().toLowerCase();

                if (cvText.contains(skillName)) {
                    matchedSkills.add(skill);
                }
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la lecture du PDF : " + e.getMessage());
        }

        return matchedSkills;
    }
}
