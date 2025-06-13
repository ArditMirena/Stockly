package com.stockly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StocklyApplication {

	public static void main(String[] args) {
		SpringApplication.run(StocklyApplication.class, args);
	}

}
