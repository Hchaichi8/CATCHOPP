package org.example.skilltestsmicroservice.Controllers;

import org.example.skilltestsmicroservice.DTO.interview.AnswerInterviewRequest;
import org.example.skilltestsmicroservice.DTO.interview.InterviewSessionDto;
import org.example.skilltestsmicroservice.DTO.interview.InterviewTurnResponseDto;
import org.example.skilltestsmicroservice.DTO.interview.StartInterviewRequest;
import org.example.skilltestsmicroservice.Services.interview.InterviewSessionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/SkillTests/ai/interview")
@CrossOrigin(origins = "*")
public class AiInterviewController {

    private final InterviewSessionService interviewSessionService;

    public AiInterviewController(InterviewSessionService interviewSessionService) {
        this.interviewSessionService = interviewSessionService;
    }

    @PostMapping("/start")
    public InterviewSessionDto startInterview(@RequestBody StartInterviewRequest request) {
        return interviewSessionService.startInterview(request);
    }

    @PostMapping("/answer")
    public InterviewTurnResponseDto answer(@RequestBody AnswerInterviewRequest request) {
        return interviewSessionService.submitAnswer(request.getSessionId(), request.getAnswer());
    }
}
