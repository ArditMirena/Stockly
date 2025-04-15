package com.stockly.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MailTestController {

    private final JavaMailSender mailSender;

    @GetMapping("/test-mail")
    public String testMail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("blendi-gjoni@outlook.com"); // <- change this
            message.setSubject("Test Email from Stockly");
            message.setText("If you're seeing this, mail setup is working!");
            mailSender.send(message);
            return "Email sent!";
        } catch (Exception e) {
            return "Failed to send email: " + e.getMessage();
        }
    }
}

