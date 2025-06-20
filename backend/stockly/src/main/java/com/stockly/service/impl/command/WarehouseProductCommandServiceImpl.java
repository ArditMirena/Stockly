package com.stockly.service.impl.command;

import com.stockly.dto.WarehouseProductDTO;
import com.stockly.dto.WarehouseProductExcelDTO;
import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.model.enums.InventoryLogAction;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.InventoryLogCommandService;
import com.stockly.service.command.WarehouseProductCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WarehouseProductCommandServiceImpl implements WarehouseProductCommandService {

    private final WarehouseProductRepository warehouseProductRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    @Qualifier("inventoryLogCommandService")
    private final InventoryLogCommandService inventoryLogCommandService;

    @Override
    public WarehouseProduct createWarehouseProduct(WarehouseProductDTO warehouseProductDTO) {
        Warehouse warehouse = warehouseRepository.findById(warehouseProductDTO.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseProductDTO.getWarehouseId()));

        Product product = productRepository.findById(warehouseProductDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + warehouseProductDTO.getProductId()));

        WarehouseProduct warehouseProduct = new WarehouseProduct();
        warehouseProduct.setWarehouse(warehouse);
        warehouseProduct.setProduct(product);
        warehouseProduct.setQuantity(warehouseProductDTO.getQuantity());

        inventoryLogCommandService.logInventoryChange(
                InventoryLogAction.RESTOCK,
                warehouse.getId(), warehouse.getName(),
                product.getId(), product.getSku(), product.getTitle(),
                warehouseProductDTO.getQuantity(), 0, warehouseProductDTO.getQuantity(),
                null, "INITIAL_STOCK",
                warehouse.getCompany().getManager().getId(), "System", "Initial stock setup", null
        );

        return warehouseProductRepository.save(warehouseProduct);
    }

    @Override
    public WarehouseProduct updateWarehouseProduct(Long id, WarehouseProductDTO warehouseProductDTO) {
        WarehouseProduct existingWarehouseProduct = warehouseProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));

        existingWarehouseProduct.setQuantity(warehouseProductDTO.getQuantity());
        existingWarehouseProduct.setAutomatedRestock(warehouseProductDTO.isAutomatedRestock());

        return warehouseProductRepository.save(existingWarehouseProduct);
    }

    @Override
    public void deleteWarehouseProduct(Long id) {
        WarehouseProduct wP = warehouseProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
        warehouseProductRepository.delete(wP);
    }

    public void assignProductToWarehouse(WarehouseProductDTO warehouseProductDTO) {
        // Fetch Warehouse and Product based on DTO data
        Warehouse warehouse = warehouseRepository.findById(warehouseProductDTO.getId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Product product = productRepository.findById(warehouseProductDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Create a new WarehouseProduct entity and set the values
        WarehouseProduct warehouseProduct = new WarehouseProduct();
        warehouseProduct.setWarehouse(warehouse);
        warehouseProduct.setProduct(product);
        warehouseProduct.setAvailability(warehouseProductDTO.getAvailability());

        // Save the new WarehouseProduct entity to the repository
        warehouseProductRepository.save(warehouseProduct);
    }

    @Override
    public WarehouseProduct importWarehouseProductFromExcel(WarehouseProductExcelDTO dto) {
        Warehouse warehouse = null;
        if (dto.getWarehouseId() != null) {
            warehouse = warehouseRepository.findById(dto.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + dto.getWarehouseId()));
        } else if (dto.getWarehouseName() != null) {
            warehouse = warehouseRepository.findByName(dto.getWarehouseName())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with name: " + dto.getWarehouseName()));
        } else {
            throw new RuntimeException("Warehouse ID or name must be provided");
        }

        Product product = productRepository.findBySku(dto.getProductSku())
                .orElseGet(() -> {
                    Product newProduct = new Product();
                    newProduct.setSku(dto.getProductSku());
                    newProduct.setTitle(dto.getProductTitle());
                    newProduct.setPrice(dto.getProductPrice());
                    newProduct.setCreatedAt(Instant.now());
                    newProduct.setUpdatedAt(Instant.now());
                    return productRepository.save(newProduct);
                });

        Optional<WarehouseProduct> existing = warehouseProductRepository.findByWarehouseAndProduct(warehouse, product);

        if (existing.isPresent()) {
            WarehouseProduct wp = existing.get();
            int quantity = wp.getQuantity();
            wp.setQuantity(wp.getQuantity() + dto.getQuantity());
            createInventoryLog(wp, "IMPORT RESTOCK EXCEL", quantity, InventoryLogAction.RESTOCK);
            return warehouseProductRepository.save(wp);
        } else {
            WarehouseProduct wp = new WarehouseProduct();
            wp.setWarehouse(warehouse);
            wp.setProduct(product);
            wp.setQuantity(dto.getQuantity());
            createInventoryLog(wp, "IMPORT EXCEL", 0, InventoryLogAction.PRODUCT_ASSIGN);
            return warehouseProductRepository.save(wp);
        }
    }

    @Override
    public List<WarehouseProduct> importWarehouseProductsFromExcel(List<WarehouseProductExcelDTO> importList) {
        List<WarehouseProduct> saved = new ArrayList<>();
        for (WarehouseProductExcelDTO dto : importList) {
            WarehouseProduct wp = importWarehouseProductFromExcel(dto);
            saved.add(wp);
        }
        return saved;
    }

    public void createInventoryLog(WarehouseProduct warehouseProduct, String referenceType, int previousQuantity, InventoryLogAction action) {
        Warehouse warehouse = warehouseProduct.getWarehouse();
        Product product = warehouseProduct.getProduct();

        inventoryLogCommandService.logInventoryChange(
                action,
                warehouse.getId(),
                warehouse.getName(),
                product.getId(),
                product.getSku(),
                product.getTitle(),
                warehouseProduct.getQuantity(),
                previousQuantity,
                warehouseProduct.getQuantity(),
                null,
                referenceType,
                warehouse.getCompany().getManager().getId(),
                warehouse.getCompany().getManager().getUsername(),
                "Restock Existing Product in Warehouse",
                null
        );
    }


}
