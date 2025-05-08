package com.stockly.service.impl.command;

import com.stockly.dto.CompanyDTO;
import com.stockly.dto.OrderDTO;
import com.stockly.dto.ReceiptDTO;
import com.stockly.mapper.ReceiptMapper;
import com.stockly.model.Receipt;
import com.stockly.repository.ReceiptRepository;
import com.stockly.service.ReceiptPdfService;
import com.stockly.service.command.EmailService;
import com.stockly.service.command.ReceiptCommandService;
import com.stockly.service.query.CompanyQueryService;
import com.stockly.service.query.OrderQueryService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ReceiptCommandServiceImpl implements ReceiptCommandService {

    @Autowired
    private ReceiptRepository receiptRepository;
    private final OrderQueryService orderQueryService;
    private final CompanyQueryService companyQueryService;
    private final ReceiptPdfService receiptPdfService;
    private final EmailService emailService;
    private final ReceiptMapper receiptMapper;

    @Override
    public Receipt saveReceipt(ReceiptDTO dto){
        Receipt receipt = receiptMapper.toEntity(dto);
        return receiptRepository.save(receipt);
    }


    public String sendAndPersistReceipt(Long orderId) throws IOException, MessagingException {
        OrderDTO order = orderQueryService.getOrderById(orderId);
        CompanyDTO buyer = companyQueryService.getCompanyById(order.getBuyerId());
        CompanyDTO supplier = companyQueryService.getCompanyById(order.getSupplierId());

        ReceiptDTO receiptDTO = ReceiptMapper.toReceiptDTO(order, buyer, supplier);

        // Save to database
        Receipt receipt = receiptMapper.toEntity(receiptDTO);
        receiptRepository.save(receipt);

        // Generate PDF
        ByteArrayInputStream pdfStream = receiptPdfService.generateReceiptPdf(receiptDTO);
        InputStreamSource attachment = new ByteArrayResource(pdfStream.readAllBytes());

        String subject = "Your Receipt for Order #" + order.getId();
        String text = "Hello " + buyer.getCompanyName() + ",<br><br>Attached is your receipt related to Order #" +order.getId()+", <br><br> Thank you for choosing Stockly!";
        emailService.sendEmailWithAttachment(buyer.getEmail(), subject, text, attachment,
                "receipt-order-" + order.getId() + ".pdf", MediaType.APPLICATION_PDF_VALUE);

        return "Receipt sent and saved successfully.";
    }
}
