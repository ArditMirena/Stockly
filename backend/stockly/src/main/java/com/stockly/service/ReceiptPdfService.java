package com.stockly.service;

import com.stockly.dto.ReceiptDTO;

import java.io.ByteArrayInputStream;
import java.io.IOException;

public interface ReceiptPdfService {
    ByteArrayInputStream generateReceiptPdf(ReceiptDTO receipt) throws IOException;
}
