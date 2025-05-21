package com.stockly.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;


@Getter
@Setter
public class CompanyDTO {
    private Long id;

    @NotBlank
    private String companyName;

    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 10, max = 15, message = "Phone number must be between 10-15 characters")
    private String phoneNumber;

    private AddressDTO address;
    private String companyType;
    private String businessType;
    private Long manager;
    private boolean hasProductionFacility;

    private Instant createdAt;
    private Instant updatedAt;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<WarehouseDTO> warehouses;

    private List<OrderDTO> ordersAsBuyer;
    private List<OrderDTO> ordersAsSupplier;
}
