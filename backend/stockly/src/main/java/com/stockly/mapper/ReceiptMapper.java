package com.stockly.mapper;

import com.stockly.dto.*;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.model.*;
import com.stockly.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReceiptMapper {

    private final CompanyRepository companyRepository;

    public static ReceiptDTO toReceiptDTO(OrderDTO order, CompanyDTO buyer, CompanyDTO supplier) {

        return ReceiptDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
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

    public Receipt toEntity(ReceiptDTO dto) {
        if (dto == null) {
            return null;
        }
        Receipt receipt = new Receipt();
        receipt.setOrderId(dto.getOrderId());
        receipt.setOrderDate(dto.getOrderDate());
        receipt.setDeliveryDate(dto.getDeliveryDate());
        receipt.setStatus(dto.getStatus());

        if (dto.getBuyer() != null) {
            Company buyer = companyRepository.findById(dto.getBuyer().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Buyer Company not found with id: "+ dto.getBuyer().getId()));
            receipt.setBuyer(buyer);
        }

        if (dto.getSupplier() != null) {
            Company supplier = companyRepository.findById(dto.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier Company not found with id: "+ dto.getBuyer().getId()));
            receipt.setSupplier(supplier);
        }

        receipt.setBuyerCompanyName(dto.getBuyer().getCompanyName());
        receipt.setBuyerEmail(dto.getBuyer().getEmail());
        receipt.setBuyerPhoneNumber(dto.getBuyer().getPhoneNumber());
        receipt.setBuyerAddress(dto.getBuyer().getAddress());
        receipt.setBuyerCompanyType(dto.getBuyer().getCompanyType());

        receipt.setSupplierCompanyName(dto.getSupplier().getCompanyName());
        receipt.setSupplierEmail(dto.getSupplier().getEmail());
        receipt.setSupplierPhoneNumber(dto.getSupplier().getPhoneNumber());
        receipt.setSupplierAddress(dto.getSupplier().getAddress());
        receipt.setSupplierCompanyType(dto.getSupplier().getCompanyType());

        receipt.setTotalPrice(dto.getTotalPrice());

        if (receipt.getItems() == null) {
            receipt.setItems(new ArrayList<>());
        }

        dto.getItems().forEach(itemDto -> {
            ReceiptItem  receiptItem =  toReceiptItemEntity(itemDto);
            receiptItem.setReceipt(receipt);

            receipt.getItems().add(receiptItem);
        });

        return receipt;
    }

    public ReceiptItem toReceiptItemEntity (ReceiptItemDTO dto) {
        ReceiptItem item = new ReceiptItem();

        item.setProductTitle(dto.getProductTitle());
        item.setProductSku(dto.getProductSku());
        item.setProductThumbnail(dto.getProductThumbnail());
        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setTotalPrice(dto.getTotalPrice());

        return item;
    }
}
