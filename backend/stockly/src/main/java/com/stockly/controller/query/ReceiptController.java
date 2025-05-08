package com.stockly.controller.query;

import com.stockly.dto.CompanyDTO;
import com.stockly.dto.OrderDTO;
import com.stockly.dto.ReceiptDTO;
import com.stockly.mapper.ReceiptMapper;
import com.stockly.service.ReceiptPdfService;
import com.stockly.service.command.EmailService;
import com.stockly.service.command.ReceiptCommandService;
import com.stockly.service.query.CompanyQueryService;
import com.stockly.service.query.OrderQueryService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final OrderQueryService orderQueryService;
    private final CompanyQueryService companyQueryService;
    private final ReceiptPdfService receiptPdfService;
    private final EmailService emailService;

    private final ReceiptCommandService receiptService;

    @PostMapping("/{orderId}/email")
    public String sendReceipt(@PathVariable Long orderId) {
        try {
            return receiptService.sendAndPersistReceipt(orderId);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to send receipt: " + e.getMessage();
        }
    }

}
