package com.stockly.dto;


import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WarehouseDTO {
    private Long id;
    private String name;
    private AddressDTO address;
    private Long companyId;
    private List<WarehouseProductDTO> products;
}
