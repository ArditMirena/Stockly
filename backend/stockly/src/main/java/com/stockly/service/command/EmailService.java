package com.stockly.service.command;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendVerificationEmail(String to, String Subject, String text) throws MessagingException;
}
