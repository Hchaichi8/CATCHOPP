package org.example.skilltestsmicroservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.openfeign.FeignClient;
import org.example.skilltestsmicroservice.Clients.UserServiceClient;
import org.example.skilltestsmicroservice.Integration.UserInAppNotificationClient;

@SpringBootTest
class SkillTestsMicroServiceApplicationTests {
    
    @MockBean
    private UserServiceClient userServiceClient;
    
    @MockBean
    private UserInAppNotificationClient userInAppNotificationClient;
    
    @Test
    void contextLoads() {}
}
