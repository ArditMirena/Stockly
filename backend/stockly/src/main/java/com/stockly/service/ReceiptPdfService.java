package com.stockly.service;

import com.stockly.dto.ReceiptDTO;

import java.io.ByteArrayInputStream;

public interface ReceiptPdfService {
    ByteArrayInputStream generateReceiptPdf(ReceiptDTO receipt);
}
