package com.stockly.service.impl.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.dto.OrderDTO;
import com.stockly.dto.ReceiptDTO;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.ReceiptMapper;
import com.stockly.model.Order;
import com.stockly.model.Receipt;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.ReceiptRepository;
import com.stockly.service.ReceiptPdfService;
import com.stockly.service.command.EmailService;
import com.stockly.service.command.ReceiptCommandService;
import com.stockly.service.query.CompanyQueryService;
import com.stockly.service.query.OrderQueryService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
@Transactional
@RequiredArgsConstructor
public class ReceiptCommandServiceImpl implements ReceiptCommandService {

    @Autowired
    private ReceiptRepository receiptRepository;
    private final OrderQueryService orderQueryService;
    private final CompanyQueryService companyQueryService;
    private final ReceiptPdfService receiptPdfService;
    private final EmailService emailService;
    private final ReceiptMapper receiptMapper;
    @Autowired
    private OrderRepository orderRepository;
    private static final Logger log = LoggerFactory.getLogger(ReceiptCommandServiceImpl.class);

    @Override
    @Transactional
    public Receipt saveReceipt(ReceiptDTO dto) {
        Receipt receipt = receiptMapper.toEntity(dto);
        Receipt saved = receiptRepository.save(receipt);
        return saved;
    }

    @Override
    public ReceiptDTO generateReceiptDTO(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Receipt entity = receiptMapper.toReceipt(order);
        return receiptMapper.toReceiptDTO(entity);
    }

    @Override
    public String sendReceipt(Long orderId, String recipientEmail) throws IOException, MessagingException {
        ReceiptDTO receiptDTO = generateReceiptDTO(orderId);

        // Generate PDF
        ByteArrayInputStream pdfStream = receiptPdfService.generateReceiptPdf(receiptDTO);
        InputStreamSource attachment = new ByteArrayResource(pdfStream.readAllBytes());

        String subject = "Your Receipt for Order #" + orderId;
        String text = "Hello " + receiptDTO.getBuyer().getCompanyName() + ",<br><br>Attached is your receipt related to Order #" + orderId + ", <br><br> Thank you for choosing Stockly!";

        emailService.sendEmailWithAttachment(
                recipientEmail,
                subject,
                text,
                attachment,
                "receipt-order-" + orderId + ".pdf",
                MediaType.APPLICATION_PDF_VALUE
        );

        return "Receipt sent successfully to " + recipientEmail;
    }

    @Override
    public String sendAndPersistReceipt(Long orderId) throws IOException, MessagingException {
        ReceiptDTO receiptDTO = generateReceiptDTO(orderId);

        // Save to database
        saveReceipt(receiptDTO);

        // Send email
        return sendReceipt(orderId, receiptDTO.getBuyer().getEmail());
    }
}