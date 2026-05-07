package org.example.skilltestsmicroservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Integration test - requires full environment (DB, Eureka). Run manually when needed.")
class SkillTestsMicroServiceApplicationTests {
    
    @Test
    void contextLoads() {}
}
