package com.stockly.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CountryCityDTO {

    private String country;
    private List<String> cities;

}
