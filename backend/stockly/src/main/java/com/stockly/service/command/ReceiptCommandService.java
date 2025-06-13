package com.stockly.service.command;

import com.stockly.dto.ReceiptDTO;
import com.stockly.model.Receipt;
import jakarta.mail.MessagingException;

import java.io.IOException;

public interface ReceiptCommandService {
    Receipt saveReceipt(ReceiptDTO dto);
    ReceiptDTO generateReceiptDTO(Long orderId);
    String sendReceipt(Long orderId, String recipientEmail) throws IOException, MessagingException;
    String sendAndPersistReceipt(Long orderId) throws IOException, MessagingException;
}
