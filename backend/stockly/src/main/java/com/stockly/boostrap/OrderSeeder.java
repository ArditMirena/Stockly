package com.stockly.boostrap;

import com.stockly.model.*;
import com.stockly.model.enums.OrderStatus;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.ProductRepository;
import com.stockly.repository.WarehouseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Component
public class OrderSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final CompanyRepository companyRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public OrderSeeder(OrderRepository orderRepository,
                       CompanyRepository companyRepository,
                       WarehouseRepository warehouseRepository,
                       ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.companyRepository = companyRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (orderRepository.count() == 0) {
            seedOrders();
        }
    }

    private void seedOrders() {
        // Get all buyers and suppliers
        List<Company> buyers = companyRepository.findByCompanyType("BUYER");
        List<Company> suppliers = companyRepository.findByCompanyType("SUPPLIER");

        // Create orders for each buyer
        for (Company buyer : buyers) {
            // Create between 3-8 orders per buyer
            int orderCount = 3 + new Random().nextInt(6);

            for (int i = 0; i < orderCount; i++) {
                // Select a random supplier
                Company supplier = suppliers.get(new Random().nextInt(suppliers.size()));

                // Get warehouses for this supplier
                List<Warehouse> supplierWarehouses = warehouseRepository.findByCompanyId(supplier.getId());
                if (supplierWarehouses.isEmpty()) continue;

                Warehouse warehouse = supplierWarehouses.get(0);

                // Create order with random date in the past 6 months
                Order order = new Order();
                order.setBuyer(buyer);
                order.setSupplier(supplier);
                order.setWarehouse(warehouse);
                order.setOrderDate(generateRandomPastDate());
                order.setStatus(getRandomOrderStatus());

                // Add 1-5 items to the order
                int itemCount = 1 + new Random().nextInt(5);
                Set<Long> addedProductIds = new HashSet<>();

                // Get products available in this warehouse
                List<Product> warehouseProducts = productRepository.findProductsByWarehouseId(warehouse.getId());

                for (int j = 0; j < itemCount && !warehouseProducts.isEmpty(); j++) {
                    // Select a random product from the warehouse
                    Product product = warehouseProducts.get(new Random().nextInt(warehouseProducts.size()));

                    // Ensure we don't add the same product twice
                    if (addedProductIds.contains(product.getId())) {
                        continue;
                    }
                    addedProductIds.add(product.getId());

                    // Generate realistic quantity (1-20 for most items, more for groceries)
                    int quantity = product.getId() >= 16 && product.getId() <= 19 ?
                            10 + new Random().nextInt(40) : // Groceries: 10-50
                            1 + new Random().nextInt(20);   // Others: 1-20

                    // Create order item
                    OrderItem orderItem = new OrderItem();
                    orderItem.setProduct(product);
                    orderItem.setQuantity(quantity);
                    orderItem.setUnitPrice(product.getPrice());
                    orderItem.calculateTotalPrice();

                    order.addItem(orderItem);
                }

                if (!order.getItems().isEmpty()) {
                    orderRepository.save(order);
                }
            }
        }
    }

    private Instant generateRandomPastDate() {
        // Generate a random date in the past 6 months
        long sixMonthsAgo = LocalDateTime.now().minusMonths(6).toEpochSecond(ZoneOffset.UTC);
        long now = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);

        long randomEpochSecond = ThreadLocalRandom.current().nextLong(sixMonthsAgo, now);
        return Instant.ofEpochSecond(randomEpochSecond);
    }

    private OrderStatus getRandomOrderStatus() {
        OrderStatus[] statuses = OrderStatus.values();
        return statuses[new Random().nextInt(statuses.length)];
    }
}