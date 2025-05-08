package com.stockly.service.command;

import com.stockly.dto.ReceiptDTO;
import com.stockly.model.Receipt;
import jakarta.mail.MessagingException;

import java.io.IOException;

public interface ReceiptCommandService {
    Receipt saveReceipt(ReceiptDTO dto);

    String sendAndPersistReceipt(Long orderId) throws IOException, MessagingException;
}
