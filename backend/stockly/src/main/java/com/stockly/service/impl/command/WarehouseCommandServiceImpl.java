package com.stockly.service.impl.command;

import com.stockly.dto.WarehouseDTO;
import com.stockly.dto.WarehouseProductDTO;
import com.stockly.exception.BusinessException;
import com.stockly.exception.ResourceNotFoundException;
import com.stockly.mapper.WarehouseMapper;
import com.stockly.model.Company;
import com.stockly.model.Product;
import com.stockly.model.Warehouse;
import com.stockly.model.WarehouseProduct;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseProductRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.WarehouseCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class WarehouseCommandServiceImpl implements WarehouseCommandService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMapper warehouseMapper;
    private final CompanyRepository companyRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseProductRepository warehouseProductRepository;

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
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
        warehouseRepository.delete(warehouse);
    }


    @Override
    public void assignProductToWarehouse(Long productId, Integer quantity, Long warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

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
            warehouseProductRepository.save(warehouseProduct);
        }
    }
}
