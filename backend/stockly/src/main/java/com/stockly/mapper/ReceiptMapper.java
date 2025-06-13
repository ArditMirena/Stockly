package com.stockly.mapper;

import com.stockly.dto.*;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.model.*;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReceiptMapper {

    private final CompanyRepository companyRepository;
    private final WarehouseRepository warehouseRepository;

    public ReceiptDTO toReceiptDTO(Receipt receipt) {
        return ReceiptDTO.builder()
                .orderId(receipt.getOrderId())
                .orderDate(receipt.getOrderDate())
                .deliveryDate(receipt.getDeliveryDate())
                .totalPrice(receipt.getTotalPrice())
                .status(receipt.getStatus())
                .buyer(toCompanySummaryDTO(receipt.getBuyer()))
                .supplier(toCompanySummaryDTO(receipt.getSupplier()))
                .destinationWarehouse(receipt.getDestinationWarehouse() != null ?
                        toWarehouseSummaryDTO(receipt.getDestinationWarehouse()) : null)
                .sourceWarehouse(receipt.getSourceWarehouse() != null ?
                        toWarehouseSummaryDTO(receipt.getSourceWarehouse()) : null)
                .items(toReceiptItemDTOList(receipt.getItems()))
                .build();
    }

    private static CompanySummaryDTO toCompanySummaryDTO(Company company) {
        return CompanySummaryDTO.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .email(company.getEmail())
                .phoneNumber(company.getPhoneNumber())
                .address(company.getAddress().toString())
                .companyType(company.getCompanyType())
                .managerId(company.getManager().getId())
                .managerName(company.getManager().getUsername())
                .managerEmail(company.getManager().getEmail())
                .build();
    }

    private static WarehouseSummaryDTO toWarehouseSummaryDTO(Warehouse warehouse) {
        if (warehouse == null) {
            return null;
        }
        return WarehouseSummaryDTO.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress() != null ? warehouse.getAddress().toString() : null)
                .build();
    }

    private static List<ReceiptItemDTO> toReceiptItemDTOList(List<ReceiptItem> items) {
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
        if (dto == null) return null;

        Receipt receipt = new Receipt();
        receipt.setOrderId(dto.getOrderId());
        receipt.setOrderDate(dto.getOrderDate());
        receipt.setDeliveryDate(dto.getDeliveryDate());
        receipt.setStatus(dto.getStatus());

        // Handle Buyer
        if (dto.getBuyer() != null) {
            Company buyer = companyRepository.findById(dto.getBuyer().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
            receipt.setBuyer(buyer);
            receipt.setBuyerCompanyName(dto.getBuyer().getCompanyName());
            receipt.setBuyerEmail(dto.getBuyer().getEmail());
            receipt.setBuyerPhoneNumber(dto.getBuyer().getPhoneNumber());
            receipt.setBuyerAddress(dto.getBuyer().getAddress());
            receipt.setBuyerCompanyType(dto.getBuyer().getCompanyType());
            receipt.setBuyerManagerId(dto.getBuyer().getManagerId());
            receipt.setBuyerManagerName(dto.getBuyer().getManagerName());
            receipt.setBuyerManagerEmail(dto.getBuyer().getManagerEmail());
        }

        // Handle Supplier
        if (dto.getSupplier() != null) {
            Company supplier = companyRepository.findById(dto.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            receipt.setSupplier(supplier);
            receipt.setSupplierCompanyName(dto.getSupplier().getCompanyName());
            receipt.setSupplierEmail(dto.getSupplier().getEmail());
            receipt.setSupplierPhoneNumber(dto.getSupplier().getPhoneNumber());
            receipt.setSupplierAddress(dto.getSupplier().getAddress());
            receipt.setSupplierCompanyType(dto.getSupplier().getCompanyType());
            receipt.setSupplierManagerId(dto.getSupplier().getManagerId());
            receipt.setSupplierManagerName(dto.getSupplier().getManagerName());
            receipt.setSupplierManagerEmail(dto.getSupplier().getManagerEmail());
        }

        // CRITICAL FIX: Handle Warehouses
        if (dto.getDestinationWarehouse() != null) {
            Warehouse destWarehouse = warehouseRepository.findById(dto.getDestinationWarehouse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found"));
            receipt.setDestinationWarehouse(destWarehouse);
            receipt.setDestinationWarehouseName(dto.getDestinationWarehouse().getName());
            receipt.setDestinationWarehouseAddress(dto.getDestinationWarehouse().getAddress());
        }

        if (dto.getSourceWarehouse() != null) {
            Warehouse sourceWarehouse = warehouseRepository.findById(dto.getSourceWarehouse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Source warehouse not found"));
            receipt.setSourceWarehouse(sourceWarehouse);
            receipt.setSourceWarehouseName(dto.getSourceWarehouse().getName());
            receipt.setSourceWarehouseAddress(dto.getSourceWarehouse().getAddress());
        }

        receipt.setTotalPrice(dto.getTotalPrice());

        // Map items
        if (dto.getItems() != null) {
            receipt.setItems(new ArrayList<>());
            dto.getItems().forEach(itemDto -> {
                ReceiptItem receiptItem = toReceiptItemEntity(itemDto);
                receiptItem.setReceipt(receipt);
                receipt.getItems().add(receiptItem);
            });
        }

        return receipt;
    }

    public Receipt toReceipt(Order order) {
        Receipt receipt = new Receipt();
        receipt.setOrderId(order.getId());
        receipt.setOrderDate(order.getOrderDate());
        receipt.setDeliveryDate(order.getDeliveryDate());
        receipt.setStatus(order.getStatus().toString());
        receipt.setItems(new ArrayList<>());

        // Handle Buyer
        if (order.getBuyer() != null) {
            Company buyer = companyRepository.findById(order.getBuyer().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));
            receipt.setBuyer(buyer);
            setCompanySnapshotFields(buyer, receipt, true);
        }

        // Handle Supplier
        if (order.getSupplier() != null) {
            Company supplier = companyRepository.findById(order.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            receipt.setSupplier(supplier);
            setCompanySnapshotFields(supplier, receipt, false);
        }

        // CRITICAL FIX: Handle Warehouses
        if (order.getDestinationWarehouse() != null) {
            Warehouse destWarehouse = warehouseRepository.findById(order.getDestinationWarehouse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found"));
            receipt.setDestinationWarehouse(destWarehouse);
            receipt.setDestinationWarehouseName(destWarehouse.getName());
            receipt.setDestinationWarehouseAddress(
                    destWarehouse.getAddress() != null ? destWarehouse.getAddress().toString() : null);
        }

        if (order.getSourceWarehouse() != null) {
            Warehouse sourceWarehouse = warehouseRepository.findById(order.getSourceWarehouse().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Source warehouse not found"));
            receipt.setSourceWarehouse(sourceWarehouse);
            receipt.setSourceWarehouseName(sourceWarehouse.getName());
            receipt.setSourceWarehouseAddress(
                    sourceWarehouse.getAddress() != null ? sourceWarehouse.getAddress().toString() : null);
        }

        receipt.setTotalPrice(order.getTotalPrice());

        // Map items
        if (order.getItems() != null) {
            order.getItems().forEach(orderItem -> {
                ReceiptItem receiptItem = toReceiptItemEntityFromOrder(orderItem);
                receiptItem.setReceipt(receipt);
                receipt.getItems().add(receiptItem);
            });
        }

        return receipt;
    }

    private void setCompanySnapshotFields(Company company, Receipt receipt, boolean isBuyer) {
        if (isBuyer) {
            receipt.setBuyerCompanyName(company.getCompanyName());
            receipt.setBuyerEmail(company.getEmail());
            receipt.setBuyerPhoneNumber(company.getPhoneNumber());
            receipt.setBuyerAddress(company.getAddress() != null ? company.getAddress().toString() : null);
            receipt.setBuyerCompanyType(company.getCompanyType());
            if (company.getManager() != null) {
                receipt.setBuyerManagerId(company.getManager().getId());
                receipt.setBuyerManagerName(company.getManager().getUsername());
                receipt.setBuyerManagerEmail(company.getManager().getEmail());
            }
        } else {
            receipt.setSupplierCompanyName(company.getCompanyName());
            receipt.setSupplierEmail(company.getEmail());
            receipt.setSupplierPhoneNumber(company.getPhoneNumber());
            receipt.setSupplierAddress(company.getAddress() != null ? company.getAddress().toString() : null);
            receipt.setSupplierCompanyType(company.getCompanyType());
            if (company.getManager() != null) {
                receipt.setSupplierManagerId(company.getManager().getId());
                receipt.setSupplierManagerName(company.getManager().getUsername());
                receipt.setSupplierManagerEmail(company.getManager().getEmail());
            }
        }
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

    public ReceiptItem toReceiptItemEntityFromOrder (OrderItem orderItem) {
        ReceiptItem item = new ReceiptItem();

        item.setProductTitle(orderItem.getProduct().getTitle());
        item.setProductSku(orderItem.getProduct().getSku());
        item.setProductThumbnail(orderItem.getProduct().getThumbnailUrl());
        item.setQuantity(orderItem.getQuantity());
        item.setUnitPrice(orderItem.getUnitPrice());
        item.setTotalPrice(orderItem.getTotalPrice());

        return item;
    }
}
