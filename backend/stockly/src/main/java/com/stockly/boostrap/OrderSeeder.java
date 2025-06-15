package com.stockly.boostrap;

import com.stockly.model.*;
import com.stockly.model.enums.OrderStatus;
import com.stockly.dto.ReceiptDTO;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.OrderRepository;
import com.stockly.repository.WarehouseRepository;
import com.stockly.service.command.ReceiptCommandService;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@org.springframework.core.annotation.Order(1)
public class OrderSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final CompanyRepository companyRepository;
    private final WarehouseRepository warehouseRepository;
    private final ReceiptCommandService receiptCommandService;

    public OrderSeeder(OrderRepository orderRepository,
                       CompanyRepository companyRepository,
                       WarehouseRepository warehouseRepository,
                       ReceiptCommandService receiptCommandService) {
        this.orderRepository = orderRepository;
        this.companyRepository = companyRepository;
        this.warehouseRepository = warehouseRepository;
        this.receiptCommandService = receiptCommandService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (orderRepository.count() == 0) {
            seedOrders();
        }
    }

    private void seedOrders() {
        List<Order> allOrders = new ArrayList<>();

        // Get all companies categorized
        List<Company> allCompanies = companyRepository.findAll();
        List<Company> buyers = allCompanies.stream()
                .filter(c -> "BUYER".equals(c.getCompanyType()))
                .collect(Collectors.toList());
        List<Company> suppliers = allCompanies.stream()
                .filter(c -> "SUPPLIER".equals(c.getCompanyType()))
                .collect(Collectors.toList());
        List<Company> manufacturers = allCompanies.stream()
                .filter(c -> "MANUFACTURER".equals(c.getCompanyType()))
                .collect(Collectors.toList());

        // Get all warehouses with products
        List<Warehouse> allWarehouses = warehouseRepository.findAllWithProducts();

        // Create 70-80% supplier-to-supplier transfer orders
        int totalOrders = 100; // Adjust based on your needs
        int supplierAsBuyerOrders = (int)(totalOrders * 0.75);

        for (int i = 0; i < supplierAsBuyerOrders; i++) {
            // Random supplier as buyer
            Company buyer = suppliers.get(ThreadLocalRandom.current().nextInt(suppliers.size()));

            // Find a different supplier to buy from
            List<Company> possibleSuppliers = suppliers.stream()
                    .filter(s -> !s.getId().equals(buyer.getId()))
                    .collect(Collectors.toList());

            if (!possibleSuppliers.isEmpty()) {
                Company supplier = possibleSuppliers.get(
                        ThreadLocalRandom.current().nextInt(possibleSuppliers.size()));

                createOrder(buyer, supplier, allWarehouses, allOrders, true);
            }
        }

        // Create remaining orders (20-25%) with manufacturers as buyers
        int manufacturerAsBuyerOrders = (int)(totalOrders * 0.20);

        for (int i = 0; i < manufacturerAsBuyerOrders; i++) {
            Company buyer = manufacturers.get(ThreadLocalRandom.current().nextInt(manufacturers.size()));
            Company supplier = suppliers.get(ThreadLocalRandom.current().nextInt(suppliers.size()));
            createOrder(buyer, supplier, allWarehouses, allOrders, true);
        }

        // Create few (5%) regular buyer orders
        int regularBuyerOrders = totalOrders - supplierAsBuyerOrders - manufacturerAsBuyerOrders;

        for (int i = 0; i < regularBuyerOrders; i++) {
            Company buyer = buyers.get(ThreadLocalRandom.current().nextInt(buyers.size()));
            Company supplier = suppliers.get(ThreadLocalRandom.current().nextInt(suppliers.size()));
            createOrder(buyer, supplier, allWarehouses, allOrders, false);
        }

        orderRepository.saveAll(allOrders);

        generateReceiptsForOrders(allOrders);
    }

    private void generateReceiptsForOrders(List<Order> orders) {
        for (Order order : orders) {
            try {
                ReceiptDTO receiptDTO = receiptCommandService.generateReceiptDTO(order.getId());
                receiptCommandService.saveReceipt(receiptDTO);

            } catch (Exception e) {
                // Log error but continue with other orders
                System.err.println("Failed to generate receipt for order " + order.getId() + ": " + e.getMessage());
            }
        }
    }

    private void createOrder(Company buyer, Company supplier,
                             List<Warehouse> allWarehouses,
                             List<Order> allOrders,
                             boolean isTransferOrder) {
        Order order = new Order();
        order.setBuyer(buyer);
        order.setSupplier(supplier);
        order.setOrderDate(generateRandomPastDate(365));
        order.setStatus(getWeightedRandomStatus(isTransferOrder));
        order.setDescription(isTransferOrder ?
                "Stock transfer #" + (allOrders.size() + 1) :
                "Customer order #" + (allOrders.size() + 1));

        // Set source warehouse (from supplier)
        List<Warehouse> supplierWarehouses = allWarehouses.stream()
                .filter(w -> w.getCompany().getId().equals(supplier.getId()))
                .filter(w -> !w.getWarehouseProducts().isEmpty())
                .collect(Collectors.toList());

        if (!supplierWarehouses.isEmpty()) {
            order.setSourceWarehouse(
                    supplierWarehouses.get(ThreadLocalRandom.current().nextInt(supplierWarehouses.size())));
        }

        // For transfer orders, set destination warehouse (buyer's warehouse)
        if (isTransferOrder) {
            List<Warehouse> buyerWarehouses = allWarehouses.stream()
                    .filter(w -> w.getCompany().getId().equals(buyer.getId()))
                    .collect(Collectors.toList());

            if (!buyerWarehouses.isEmpty()) {
                order.setDestinationWarehouse(
                        buyerWarehouses.get(ThreadLocalRandom.current().nextInt(buyerWarehouses.size())));
            }
        }

        if (addOrderItems(order, supplierWarehouses)) {
            allOrders.add(order);
        }
    }
    

    private OrderStatus getWeightedRandomStatus(boolean isSupplierOrder) {
        double rand = ThreadLocalRandom.current().nextDouble();

        if (isSupplierOrder) {
            // Higher probability of COMPLETED status for supplier-to-supplier orders
            if (rand < 0.7) return OrderStatus.DELIVERED;
            if (rand < 0.85) return OrderStatus.SHIPPED;
            if (rand < 0.95) return OrderStatus.PROCESSING;
        } else {
            // Regular buyer orders have more varied statuses
            if (rand < 0.5) return OrderStatus.DELIVERED;
            if (rand < 0.75) return OrderStatus.SHIPPED;
            if (rand < 0.9) return OrderStatus.PROCESSING;
        }
        return OrderStatus.CANCELLED;
    }

    private boolean sameIndustry(String buyerBusinessType, String supplierName) {
        if (buyerBusinessType == null) return false;
        String buyerIndustry = buyerBusinessType.replace(" Retail", "");
        return supplierName.contains(buyerIndustry);
    }

    private Instant generateRandomPastDate(int daysBack) {
        long now = Instant.now().getEpochSecond();
        long past = now - (daysBack * 86400L);
        return Instant.ofEpochSecond(ThreadLocalRandom.current().nextLong(past, now));
    }

    private boolean addOrderItems(Order order, List<Warehouse> sourceWarehouses) {
        // Select 1-2 source warehouses randomly
        Collections.shuffle(sourceWarehouses);
        int warehouseCount = Math.min(1 + ThreadLocalRandom.current().nextInt(2), sourceWarehouses.size());
        List<Warehouse> selectedWarehouses = sourceWarehouses.subList(0, warehouseCount);

        // Add items from these warehouses
        Set<Long> addedProductIds = new HashSet<>();
        int itemCount = 1 + ThreadLocalRandom.current().nextInt(5); // 1-5 items
        boolean itemsAdded = false;

        for (int j = 0; j < itemCount && !selectedWarehouses.isEmpty(); j++) {
            Warehouse warehouse = selectedWarehouses.get(
                    ThreadLocalRandom.current().nextInt(selectedWarehouses.size()));

            List<WarehouseProduct> availableProducts = warehouse.getWarehouseProducts().stream()
                    .filter(wp -> wp.getQuantity() > 0)
                    .filter(wp -> !addedProductIds.contains(wp.getProduct().getId()))
                    .collect(Collectors.toList());

            if (availableProducts.isEmpty()) {
                selectedWarehouses.remove(warehouse);
                continue;
            }

            WarehouseProduct wp = availableProducts.get(
                    ThreadLocalRandom.current().nextInt(availableProducts.size()));
            Product product = wp.getProduct();
            addedProductIds.add(product.getId());

            int quantity = generateRealisticQuantity(product.getId(), wp.getQuantity());

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(product.getPrice());
            item.calculateTotalPrice();

            order.addItem(item);

            if (order.getSourceWarehouse() == null) {
                order.setSourceWarehouse(warehouse);
            }

            if (order.getStatus() != OrderStatus.CANCELLED) {
                wp.setQuantity(wp.getQuantity() - quantity);
            }

            itemsAdded = true;
        }

        if (itemsAdded) {
            order.setTotalPrice(order.getItems().stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));

            if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
                order.setShipmentId("SH" + Instant.now().getEpochSecond() +
                        ThreadLocalRandom.current().nextInt(100, 999));
            }
        }

        return itemsAdded;
    }


    private int generateRealisticQuantity(Long productId, int maxAvailable) {
        int baseQuantity;
        if (productId <= 20) {    // Small items (tech/electronics)
            baseQuantity = 1 + ThreadLocalRandom.current().nextInt(10);
        } else if (productId <= 40) {  // Fashion items
            baseQuantity = 1 + ThreadLocalRandom.current().nextInt(5);
        } else if (productId <= 60) {  // Food items
            baseQuantity = 5 + ThreadLocalRandom.current().nextInt(20);
        } else {                       // Large items (furniture/auto)
            baseQuantity = 1 + ThreadLocalRandom.current().nextInt(3);
        }
        return Math.min(baseQuantity, maxAvailable);
    }
}