package org.example.projectmicroservice.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectScopeAnalysisDto {
    /** e.g. good, needs_detail, vague, unrealistic */
    private String quality;
    private List<String> missing;
    private List<String> unrealisticNotes;
    private List<String> suggestions;
    private boolean readyToPost;
    /** One-line summary for banners */
    private String headline;
    private boolean aiUsed;
    /** heuristic | openrouter | openai */
    private String engine;

    public static ProjectScopeAnalysisDto empty() {
        return ProjectScopeAnalysisDto.builder()
                .quality("unknown")
                .missing(new ArrayList<>())
                .unrealisticNotes(new ArrayList<>())
                .suggestions(new ArrayList<>())
                .readyToPost(true)
                .headline("")
                .aiUsed(false)
                .engine("none")
                .build();
    }
}
