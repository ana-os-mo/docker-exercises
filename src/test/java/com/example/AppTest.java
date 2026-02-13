package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

@SpringBootTest
class AppTest {

    @Autowired
    private Application application;

    @Test
    void contextLoads() {
    }

    @Test
    void testAppStatusIsOK() {
        String result = application.getStatus();
        assertEquals("OK", result);
    }
}
