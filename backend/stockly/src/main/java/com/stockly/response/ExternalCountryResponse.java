package com.stockly.response;

import com.stockly.dto.CountryCityDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ExternalCountryResponse {
    private boolean error;
    private String msg;
    private List<CountryCityDTO> data;
}
