package com.stockly.service.query;

import com.stockly.dto.ReceiptDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface ReceiptQueryService {
    List<ReceiptDTO> getAllReceipts();
    ReceiptDTO getReceiptById(Long id);
    Page<ReceiptDTO> getReceipts(PageRequest pageRequest,
                                 Long buyerCompanyId,
                                 Long supplierCompanyId,
                                 Long companyId,
                                 Long sourceWarehouseId,
                                 Long destinationWarehouseId,
                                 Long warehouseId,
                                 Long managerId,
                                 Long buyerManagerId,
                                 Long supplierManagerId);

    List<ReceiptDTO> searchReceipts(String searchTerm);

    List<ReceiptDTO> getReceiptsByCompanyId(Long companyId);
    List<ReceiptDTO> getReceiptsByBuyerCompanyId(Long buyerCompanyId);
    List<ReceiptDTO> getReceiptsBySupplierCompanyId(Long supplierCompanyId);
    List<ReceiptDTO> getReceiptsByWarehouseId(Long warehouseId);
    List<ReceiptDTO> getReceiptsByDestinationWarehouseId(Long destinationWarehouseId);
    List<ReceiptDTO> getReceiptsBySourceWarehouseId(Long sourceWarehouseId);
    List<ReceiptDTO> getReceiptsByWarehouses(Long sourceWarehouseId, Long destinationWarehouseId);
    List<ReceiptDTO> getReceiptsByCompanies(Long buyerCompanyId, Long supplierCompanyId);
    List<ReceiptDTO> getReceiptsByManagerId(Long managerId);
    List<ReceiptDTO> getReceiptsByBuyerManagerId(Long buyerManagerId);
    List<ReceiptDTO> getReceiptsBySupplierManagerId(Long supplierManagerId);
}

