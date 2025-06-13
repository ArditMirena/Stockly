package com.stockly.controller.command;


import com.stockly.dto.ReceiptDTO;
import com.stockly.service.ReceiptPdfService;
import com.stockly.service.command.ReceiptCommandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
public class ReceiptCommandController {

    private final ReceiptCommandService receiptCommandService;
    private final ReceiptPdfService receiptPdfService;

    @PostMapping("/{orderId}/email")
    @Operation(summary = "Send receipt by email",
            description = "Sends a receipt for the specified order to the buyer's email")
    @ApiResponse(responseCode = "200", description = "Receipt sent successfully")
    @ApiResponse(responseCode = "400", description = "Invalid order ID")
    @ApiResponse(responseCode = "500", description = "Internal server error")
    public ResponseEntity<String> sendReceipt(@PathVariable Long orderId) {
        try {
            String result = receiptCommandService.sendAndPersistReceipt(orderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (MessagingException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send receipt: " + e.getMessage());
        }
    }

    @PostMapping("/{orderId}")
    @Operation(summary = "Create receipt",
            description = "Creates a receipt for the specified order without sending it")
    @ApiResponse(responseCode = "200", description = "Receipt created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid order ID")
    public ResponseEntity<ReceiptDTO> createReceipt(@PathVariable Long orderId) {
        try {
            ReceiptDTO receiptDTO = receiptCommandService.generateReceiptDTO(orderId);
            receiptCommandService.saveReceipt(receiptDTO);
            return ResponseEntity.ok(receiptDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{orderId}/download")
    @Operation(summary = "Download receipt",
            description = "Generates and downloads a PDF receipt for the specified order")
    @ApiResponse(responseCode = "200", description = "Receipt downloaded successfully")
    @ApiResponse(responseCode = "400", description = "Invalid order ID")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long orderId) {
        try {
            ReceiptDTO receiptDTO = receiptCommandService.generateReceiptDTO(orderId);
            byte[] pdfBytes = receiptPdfService.generateReceiptPdf(receiptDTO).readAllBytes();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=receipt-order-" + orderId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
