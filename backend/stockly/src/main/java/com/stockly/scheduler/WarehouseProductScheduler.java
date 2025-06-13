package com.stockly.scheduler;

import com.stockly.service.query.WarehouseProductQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@Slf4j
@RequiredArgsConstructor
public class WarehouseProductScheduler {

    private final WarehouseProductQueryService warehouseProductQueryService;

    @Scheduled(cron = "0 0 1 1 * *")
    public void runAutoRestockMonthly() {
        log.info("Running automated restock job on {}", java.time.LocalDate.now());

        String month = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMM"));
        warehouseProductQueryService.orderAutomationWarehouseProducts(month);
    }

}
