package com.stockly.service.impl.command;

import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.exception.BusinessException;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.WarehouseMapper;
import com.stockly.model.*;
import com.stockly.model.enums.InventoryLogAction;
import com.stockly.repository.*;
import com.stockly.service.command.InventoryLogCommandService;
import com.stockly.service.command.WarehouseCommandService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseCommandServiceImpl implements WarehouseCommandService {

    private final EntityManager entityManager;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final CompanyRepository companyRepository;
    private final OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseProductRepository warehouseProductRepository;
    @Autowired
    private ReceiptRepository receiptRepository;
    private final InventoryLogCommandService inventoryLogCommandService;

    @Override
    public WarehouseDTO createWarehouse(WarehouseDTO warehouseDTO) {
        Warehouse warehouse = warehouseMapper.toEntity(warehouseDTO);

        Company company = companyRepository.findById(warehouseDTO.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        warehouse.setCompany(company);

        if (warehouseDTO.getProducts() != null) {
            for (WarehouseProductDTO productDTO : warehouseDTO.getProducts()) {
                Product product = productRepository.findById(productDTO.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + productDTO.getProductId()));

                WarehouseProduct warehouseProduct = new WarehouseProduct();
                warehouseProduct.setWarehouse(warehouse);
                warehouseProduct.setProduct(product);
                warehouseProduct.setQuantity(productDTO.getQuantity());

                // Add the WarehouseProduct to the warehouse
                warehouse.getWarehouseProducts().add(warehouseProduct);
            }
        }

        company.addWarehouse(warehouse);

        Warehouse saved = warehouseRepository.save(warehouse);

        companyRepository.saveAndFlush(company);

        return warehouseMapper.toDto(saved);
    }

    @Override
    public WarehouseDTO updateWarehouse(Long id, WarehouseDTO warehouseDTO) {
        Warehouse existing = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));

        Warehouse updated = warehouseMapper.toEntity(warehouseDTO);
        updated.setId(existing.getId()); // Keep existing ID
        Warehouse saved = warehouseRepository.save(updated);

        return warehouseMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void deleteWarehouse(Long id) {
        // 1. First check if warehouse exists
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));

        // 2. For inactive warehouses - perform hard delete
        if (!warehouse.getIsActive()) {
            // Execute all deletions in optimal order
            warehouseProductRepository.deleteByWarehouseId(id);  // Direct SQL delete
            orderRepository.nullifySourceReferences(id);
            orderRepository.nullifyDestinationReferences(id);
            receiptRepository.nullifySourceReferences(id);
            receiptRepository.nullifyDestinationReferences(id);

            // Clear persistence context
            entityManager.clear();

            // Final delete with native query to bypass any JPA issues
            warehouseRepository.deleteByIdNative(id);

            return;
        }
            warehouse.setIsActive(false);
            warehouseRepository.save(warehouse);

    }


    @Override
    public void assignProductToWarehouse(Long productId, Integer quantity, Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

        if(!warehouse.getIsActive()) {
            throw new BusinessException("Warehouse is not active");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Optional<WarehouseProduct> optionalExisting = warehouseProductRepository.findByWarehouseAndProduct(warehouse, product);

        if (optionalExisting.isPresent()) {
            WarehouseProduct existing = optionalExisting.get();
            int newQuantity = existing.getQuantity() + quantity;
            if (newQuantity < 0) {
                throw new BusinessException("Cannot deduct more than available quantity");
            }
            existing.setQuantity(newQuantity);
            warehouseProductRepository.save(existing);
        } else {
            if (quantity < 0) {
                throw new BusinessException("Cannot deduct from non-existent inventory");
            }
            WarehouseProduct warehouseProduct = new WarehouseProduct();
            warehouseProduct.setWarehouse(warehouse);
            warehouseProduct.setProduct(product);
            warehouseProduct.setQuantity(quantity);
            warehouse.getWarehouseProducts().add(warehouseProduct);

            inventoryLogCommandService.logInventoryChange(
                    InventoryLogAction.PRODUCT_ASSIGN,
                    warehouse.getId(),
                    warehouse.getName(),
                    product.getId(),
                    product.getSku(),
                    product.getTitle(),
                    warehouseProduct.getQuantity(),
                    0,
                    warehouseProduct.getQuantity(),
                    null,
                    "ASSIGN",
                    warehouse.getCompany().getManager().getId(),
                    warehouse.getCompany().getManager().getUsername(),
                    "Assigned Product to Warehouse",
                    null
            );

            warehouseProductRepository.save(warehouseProduct);
        }
    }
}
