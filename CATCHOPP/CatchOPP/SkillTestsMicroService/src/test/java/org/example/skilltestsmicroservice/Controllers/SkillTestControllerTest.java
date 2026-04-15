package org.example.skilltestsmicroservice.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.skilltestsmicroservice.Entities.Certification;
import org.example.skilltestsmicroservice.Entities.SkillTest;
import org.example.skilltestsmicroservice.Services.AiCvService;
import org.example.skilltestsmicroservice.Services.SkillTestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SkillTestController.class)
@DisplayName("SkillTestController Integration Tests")
class SkillTestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SkillTestService skillTestService;

    @MockBean
    private AiCvService aiCvService;

    @Autowired
    private ObjectMapper objectMapper;

    private SkillTest sampleTest;

    @BeforeEach
    void setUp() {
        sampleTest = new SkillTest();
        sampleTest.setId(1L);
        sampleTest.setTitle("Java Basics");
        sampleTest.setCategory("Java");
        sampleTest.setActive(true);
        sampleTest.setPassScore(70);
    }

    @Test
    @DisplayName("GET /SkillTests/tests - should return 200 with list of active tests")
    void getAllTests_shouldReturn200() throws Exception {
        when(skillTestService.getAllActiveTests()).thenReturn(List.of(sampleTest));

        mockMvc.perform(get("/SkillTests/tests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Basics"))
                .andExpect(jsonPath("$[0].category").value("Java"));
    }

    @Test
    @DisplayName("GET /SkillTests/tests/{id} - should return 200 with test")
    void getTestById_shouldReturn200() throws Exception {
        when(skillTestService.getTestById(1L)).thenReturn(sampleTest);

        mockMvc.perform(get("/SkillTests/tests/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Java Basics"));
    }

    @Test
    @DisplayName("POST /SkillTests/admin/tests - should create test and return 200")
    void createTest_shouldReturn200() throws Exception {
        when(skillTestService.createTest(any(SkillTest.class))).thenReturn(sampleTest);

        mockMvc.perform(post("/SkillTests/admin/tests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleTest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java Basics"));
    }

    @Test
    @DisplayName("DELETE /SkillTests/admin/tests/{id} - should return 200")
    void deleteTest_shouldReturn200() throws Exception {
        doNothing().when(skillTestService).deleteTest(1L);

        mockMvc.perform(delete("/SkillTests/admin/tests/1"))
                .andExpect(status().isOk());

        verify(skillTestService).deleteTest(1L);
    }

    @Test
    @DisplayName("POST /SkillTests/submit-with-name - should return certification")
    void submitTest_shouldReturnCertification() throws Exception {
        Certification cert = new Certification();
        cert.setUserId(10L);
        cert.setTestId(1L);
        cert.setScore(85);
        cert.setPassed(true);

        when(skillTestService.submitTest(eq(10L), eq(1L), anyMap(), eq("Alice"))).thenReturn(cert);

        Map<String, String> answers = Map.of("1", "A", "2", "B");

        mockMvc.perform(post("/SkillTests/submit-with-name")
                        .param("userId", "10")
                        .param("testId", "1")
                        .param("userName", "Alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(answers)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(85))
                .andExpect(jsonPath("$.passed").value(true));
    }

    @Test
    @DisplayName("GET /SkillTests/certifications/user/{userId} - should return user certifications")
    void getUserCertifications_shouldReturnList() throws Exception {
        Certification cert = new Certification();
        cert.setUserId(10L);
        cert.setPassed(true);
        cert.setScore(90);

        when(skillTestService.getUserCertifications(10L)).thenReturn(List.of(cert));

        mockMvc.perform(get("/SkillTests/certifications/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].score").value(90))
                .andExpect(jsonPath("$[0].passed").value(true));
    }

    @Test
    @DisplayName("GET /SkillTests/categories - should return category list")
    void getCategories_shouldReturnList() throws Exception {
        when(skillTestService.getAvailableCategories()).thenReturn(List.of("Java", "Python", "Angular"));

        mockMvc.perform(get("/SkillTests/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Java"))
                .andExpect(jsonPath("$[1]").value("Python"));
    }

    @Test
    @DisplayName("PUT /SkillTests/admin/tests/{id} - should update and return test")
    void updateTest_shouldReturn200() throws Exception {
        SkillTest updated = new SkillTest();
        updated.setId(1L);
        updated.setTitle("Advanced Java");
        updated.setPassScore(80);

        when(skillTestService.updateTest(eq(1L), any(SkillTest.class))).thenReturn(updated);

        mockMvc.perform(put("/SkillTests/admin/tests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Advanced Java"))
                .andExpect(jsonPath("$.passScore").value(80));
    }
}
