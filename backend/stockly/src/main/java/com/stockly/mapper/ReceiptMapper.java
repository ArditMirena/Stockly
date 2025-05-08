package com.stockly.mapper;

import com.stockly.dto.*;
import com.stockly.model.*;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class ReceiptMapper {

    public static ReceiptDTO toReceiptDTO(OrderDTO order, CompanyDTO buyer, CompanyDTO supplier) {
        Instant instant = order.getOrderDate();
        Date date = Date.from(instant);

        return ReceiptDTO.builder()
                .orderId(order.getId())
                .orderDate(date)
                .deliveryDate(order.getDeliveryDate())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().toString())
                .buyer(toCompanySummaryDTO(buyer))
                .supplier(toCompanySummaryDTO(supplier))
                .items(toReceiptItemDTOList(order.getItems()))
                .build();
    }

    private static CompanySummaryDTO toCompanySummaryDTO(CompanyDTO company) {
        return CompanySummaryDTO.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .email(company.getEmail())
                .phoneNumber(company.getPhoneNumber())
                .address(company.getAddress().getStreet())
                .companyType(company.getCompanyType())
                .build();
    }

    private static List<ReceiptItemDTO> toReceiptItemDTOList(List<OrderItemDTO> items) {
        return items.stream()
                .map(item -> ReceiptItemDTO.builder()
                        .productTitle(item.getProductTitle())
                        .productSku(item.getProductSku())
                        .productThumbnail(item.getProductThumbnail())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());
    }

}
