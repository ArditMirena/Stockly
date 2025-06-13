package com.stockly.controller.query;

import com.stockly.dto.ReceiptDTO;
import com.stockly.service.query.ReceiptQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
@Tag(name = "Receipt Query", description = "Endpoints for querying receipt information")
public class ReceiptQueryController {

    private final ReceiptQueryService receiptQueryService;

    @GetMapping
    @Operation(summary = "Get all receipts", description = "Retrieve a list of all receipts")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all receipts")
    public ResponseEntity<List<ReceiptDTO>> getAllReceipts() {
        List<ReceiptDTO> receipts = receiptQueryService.getAllReceipts();
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get receipt by ID", description = "Retrieve a specific receipt by its ID")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved the receipt")
    @ApiResponse(responseCode = "404", description = "Receipt not found")
    public ResponseEntity<ReceiptDTO> getReceiptById(@PathVariable Long id) {
        ReceiptDTO receipt = receiptQueryService.getReceiptById(id);
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/search")
    @Operation(summary = "Search receipts", description = "Search receipts by a general search term")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved matching receipts")
    public ResponseEntity<List<ReceiptDTO>> searchReceipts(@RequestParam String searchTerm) {
        List<ReceiptDTO> receipts = receiptQueryService.searchReceipts(searchTerm);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/page")
    @Operation(summary = "Get paginated receipts with filters",
            description = "Retrieve paginated receipts with various filtering options")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved paginated receipts")
    public ResponseEntity<Page<ReceiptDTO>> getReceipts(
            @RequestParam(value = "offset", defaultValue = "0") Integer offset,
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "orderId") String sortBy,
            @RequestParam(value = "buyerCompanyId", required = false) Long buyerCompanyId,
            @RequestParam(value = "supplierCompanyId", required = false) Long supplierCompanyId,
            @RequestParam(value = "companyId", required = false) Long companyId,
            @RequestParam(value = "sourceWarehouseId", required = false) Long sourceWarehouseId,
            @RequestParam(value = "destinationWarehouseId", required = false) Long destinationWarehouseId,
            @RequestParam(value = "warehouseId", required = false) Long warehouseId,
            @RequestParam(value = "managerId", required = false) Long managerId,
            @RequestParam(value = "buyerManagerId", required = false) Long buyerManagerId,
            @RequestParam(value = "supplierManagerId", required = false) Long supplierManagerId) {

        PageRequest pageRequest = PageRequest.of(offset, pageSize, Sort.by(sortBy));
        Page<ReceiptDTO> receipts = receiptQueryService.getReceipts(
                pageRequest,
                buyerCompanyId,
                supplierCompanyId,
                companyId,
                sourceWarehouseId,
                destinationWarehouseId,
                warehouseId,
                managerId,
                buyerManagerId,
                supplierManagerId
        );
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Get receipts by company ID",
            description = "Retrieve receipts associated with a specific company")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved company receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByCompanyId(@PathVariable Long companyId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByCompanyId(companyId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/buyer-company/{buyerCompanyId}")
    @Operation(summary = "Get receipts by buyer company ID",
            description = "Retrieve receipts where the specified company is the buyer")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved buyer company receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByBuyerCompanyId(@PathVariable Long buyerCompanyId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByBuyerCompanyId(buyerCompanyId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/supplier-company/{supplierCompanyId}")
    @Operation(summary = "Get receipts by supplier company ID",
            description = "Retrieve receipts where the specified company is the supplier")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved supplier company receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsBySupplierCompanyId(@PathVariable Long supplierCompanyId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsBySupplierCompanyId(supplierCompanyId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get receipts by warehouse ID",
            description = "Retrieve receipts associated with a specific warehouse")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved warehouse receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByWarehouseId(@PathVariable Long warehouseId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByWarehouseId(warehouseId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/source-warehouse/{sourceWarehouseId}")
    @Operation(summary = "Get receipts by source warehouse ID",
            description = "Retrieve receipts where the specified warehouse is the source")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved source warehouse receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsBySourceWarehouseId(@PathVariable Long sourceWarehouseId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsBySourceWarehouseId(sourceWarehouseId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/destination-warehouse/{destinationWarehouseId}")
    @Operation(summary = "Get receipts by destination warehouse ID",
            description = "Retrieve receipts where the specified warehouse is the destination")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved destination warehouse receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByDestinationWarehouseId(@PathVariable Long destinationWarehouseId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByDestinationWarehouseId(destinationWarehouseId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/warehouses")
    @Operation(summary = "Get receipts by source and/or destination warehouses",
            description = "Retrieve receipts filtered by source and/or destination warehouses")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByWarehouses(
            @RequestParam(required = false) Long sourceWarehouseId,
            @RequestParam(required = false) Long destinationWarehouseId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByWarehouses(sourceWarehouseId, destinationWarehouseId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/companies")
    @Operation(summary = "Get receipts by buyer and/or supplier companies",
            description = "Retrieve receipts filtered by buyer and/or supplier companies")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByCompanies(
            @RequestParam(required = false) Long buyerCompanyId,
            @RequestParam(required = false) Long supplierCompanyId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByCompanies(buyerCompanyId, supplierCompanyId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Get receipts by manager ID",
            description = "Retrieve receipts associated with a specific manager")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved manager receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByManagerId(@PathVariable Long managerId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByManagerId(managerId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/buyer-manager/{buyerManagerId}")
    @Operation(summary = "Get receipts by buyer manager ID",
            description = "Retrieve receipts where the specified manager is the buyer manager")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved buyer manager receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsByBuyerManagerId(@PathVariable Long buyerManagerId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsByBuyerManagerId(buyerManagerId);
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/supplier-manager/{supplierManagerId}")
    @Operation(summary = "Get receipts by supplier manager ID",
            description = "Retrieve receipts where the specified manager is the supplier manager")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved supplier manager receipts")
    public ResponseEntity<List<ReceiptDTO>> getReceiptsBySupplierManagerId(@PathVariable Long supplierManagerId) {
        List<ReceiptDTO> receipts = receiptQueryService.getReceiptsBySupplierManagerId(supplierManagerId);
        return ResponseEntity.ok(receipts);
    }
}