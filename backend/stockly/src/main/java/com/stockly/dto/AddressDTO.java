package com.stockly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressDTO {

    @NotBlank
    private String street;

    private String postalCode;

    @NotNull
    private Long cityId;
}
