package org.example.skilltestsmicroservice.Controllers;

import org.example.skilltestsmicroservice.Services.interview.AiChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/SkillTests/ai/chat")
@CrossOrigin(origins = "*")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    /**
     * POST /SkillTests/ai/chat/message
     * Body: { history: [{role, content}], message: "user text" }
     * Returns: { reply: "AI response" }
     */
    @PostMapping("/message")
    public Map<String, String> chat(@RequestBody ChatRequest request) {
        String reply = aiChatService.chat(request.history(), request.message());
        return Map.of("reply", reply);
    }

    public record ChatRequest(
            List<Map<String, String>> history,
            String message
    ) {}
}
