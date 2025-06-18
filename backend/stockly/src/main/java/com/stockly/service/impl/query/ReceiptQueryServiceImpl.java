package com.stockly.service.impl.query;

import com.stockly.dto.ReceiptDTO;
import com.stockly.mapper.ReceiptMapper;
import com.stockly.model.Receipt;
import com.stockly.repository.ReceiptRepository;
import com.stockly.service.query.ReceiptQueryService;
import com.stockly.specification.CompanySpecification;
import com.stockly.specification.ReceiptSpecification;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceiptQueryServiceImpl implements ReceiptQueryService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptMapper receiptMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getAllReceipts() {
        return receiptRepository.findAll().stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptDTO getReceiptById(Long id) {
        Receipt receipt = receiptRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Receipt not found with id: "+id));
        return receiptMapper.toReceiptDTO(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReceiptDTO> getReceipts(
            PageRequest pageRequest,
            Long buyerCompanyId,
            Long supplierCompanyId,
            Long companyId,
            Long sourceWarehouseId,
            Long destinationWarehouseId,
            Long warehouseId,
            Long managerId,
            Long buyerManagerId,
            Long supplierManagerId,
            String searchTerm
    ) {
        // Create a typed Specification<Receipt>
        Specification<Receipt> spec = Specification.where(null);

        if (StringUtils.isNotEmpty(searchTerm)) {
            spec = spec.and(ReceiptSpecification.unifiedSearch(searchTerm));
        }
        if (buyerCompanyId != null) {
            spec = spec.and(ReceiptSpecification.byBuyerCompanyId(buyerCompanyId));
        }
        if (supplierCompanyId != null) {
            spec = spec.and(ReceiptSpecification.bySupplierCompanyId(supplierCompanyId));
        }
        if (companyId != null) {
            spec = spec.and(ReceiptSpecification.byCompanyId(companyId));
        }
        if (sourceWarehouseId != null) {
            spec = spec.and(ReceiptSpecification.bySourceWarehouseId(sourceWarehouseId));
        }
        if (destinationWarehouseId != null) {
            spec = spec.and(ReceiptSpecification.byDestinationWarehouseId(destinationWarehouseId));
        }
        if (warehouseId != null) {
            spec = spec.and(ReceiptSpecification.byWarehouseId(warehouseId));
        }
        if (managerId != null) {
            spec = spec.and(ReceiptSpecification.byManagerId(managerId));
        }
        if (buyerManagerId != null) {
            spec = spec.and(ReceiptSpecification.byBuyerManagerId(buyerManagerId));
        }
        if (supplierManagerId != null) {
            spec = spec.and(ReceiptSpecification.bySupplierManagerId(supplierManagerId));
        }

        Page<Receipt> receipts = receiptRepository.findAll(spec, pageRequest);
        return receipts.map(receiptMapper::toReceiptDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> searchReceipts(String searchTerm){
        final Specification<Receipt> specification = ReceiptSpecification.unifiedSearch(searchTerm);
        final List<Receipt> receipts = receiptRepository.findAll(specification);
        return receipts.stream().map(receiptMapper::toReceiptDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByCompanyId(Long companyId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.byCompanyId(companyId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByBuyerCompanyId(Long buyerCompanyId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.byBuyerCompanyId(buyerCompanyId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsBySupplierCompanyId(Long supplierCompanyId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.bySupplierCompanyId(supplierCompanyId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByWarehouseId(Long warehouseId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.byWarehouseId(warehouseId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByDestinationWarehouseId(Long destinationWarehouseId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.byDestinationWarehouseId(destinationWarehouseId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsBySourceWarehouseId(Long sourceWarehouseId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.bySourceWarehouseId(sourceWarehouseId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByWarehouses(Long sourceWarehouseId, Long destinationWarehouseId) {
        Specification<Receipt> spec = Specification.where(null);

        if (sourceWarehouseId != null) {
            spec = spec.and(ReceiptSpecification.bySourceWarehouseId(sourceWarehouseId));
        }
        if (destinationWarehouseId != null) {
            spec = spec.and(ReceiptSpecification.byDestinationWarehouseId(destinationWarehouseId));
        }

        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByCompanies(Long buyerCompanyId, Long supplierCompanyId) {
        Specification<Receipt> spec = Specification.where(null);

        if (buyerCompanyId != null) {
            spec = spec.and(ReceiptSpecification.byBuyerCompanyId(buyerCompanyId));
        }
        if (supplierCompanyId != null) {
            spec = spec.and(ReceiptSpecification.bySupplierCompanyId(supplierCompanyId));
        }

        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByManagerId(Long managerId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.byManagerId(managerId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsByBuyerManagerId(Long buyerManagerId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.byBuyerManagerId(buyerManagerId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptDTO> getReceiptsBySupplierManagerId(Long supplierManagerId) {
        Specification<Receipt> spec = Specification.where(ReceiptSpecification.bySupplierManagerId(supplierManagerId));
        return receiptRepository.findAll(spec).stream()
                .map(receiptMapper::toReceiptDTO)
                .collect(Collectors.toList());
    }
}
