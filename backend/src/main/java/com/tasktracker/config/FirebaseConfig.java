// src/main/java/com/tasktracker/config/FirebaseConfig.java
package com.tasktracker.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.service-account-path:classpath:firebase-service-account.json}")
    private Resource serviceAccountResource;

    @Value("${app.firebase.service-account-json:}")
    private String serviceAccountJson;

    @Value("${app.firebase.service-account-base64:}")
    private String serviceAccountBase64;

    @Value("${firebase.database-url}")
    private String databaseUrl;

    @PostConstruct
    public void initFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials = GoogleCredentials.fromStream(getServiceAccountStream());

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setDatabaseUrl(databaseUrl)
                .build();

            FirebaseApp.initializeApp(options);
        }
    }

    private InputStream getServiceAccountStream() throws IOException {
        if (!serviceAccountJson.isBlank()) {
            return new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        }

        if (!serviceAccountBase64.isBlank()) {
            byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64);
            return new ByteArrayInputStream(decoded);
        }

        return serviceAccountResource.getInputStream();
    }
}
