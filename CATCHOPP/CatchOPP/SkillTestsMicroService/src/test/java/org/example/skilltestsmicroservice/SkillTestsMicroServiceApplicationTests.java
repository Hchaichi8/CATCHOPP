package org.example.skilltestsmicroservice;

import org.junit.jupiter.api.Test;

/**
 * Basic smoke test — does not load full Spring context
 * to avoid requiring a real database connection in CI.
 */
class SkillTestsMicroServiceApplicationTests {

    @Test
    void contextLoads() {
        // Unit tests are in SkillTestServiceTest and SkillTestControllerTest
        // Full integration tests require a running database
    }
}
