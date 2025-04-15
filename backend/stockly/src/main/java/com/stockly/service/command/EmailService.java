package com.stockly.service.command;

import jakarta.mail.MessagingException;
import org.springframework.core.io.InputStreamSource;

public interface EmailService {
    void sendVerificationEmail(String to, String Subject, String text) throws MessagingException;
    void sendEmailWithAttachment(String to, String subject, String text,
                                 InputStreamSource attachment, String filename, String mimeType)
            throws MessagingException;
}
