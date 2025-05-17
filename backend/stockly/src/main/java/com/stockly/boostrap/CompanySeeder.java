package com.stockly.boostrap;

import com.stockly.model.*;
import com.stockly.repository.CompanyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class CompanySeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;

    public CompanySeeder(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (companyRepository.count() < 10) {
            seedCompanies();
        }
    }

    private void seedCompanies() {
        // Create 5 buyers
        List<Company> buyers = Arrays.asList(
                createBuyer("Tech Solutions Inc", "tech@example.com", "1234567890", "Technology Retail"),
                createBuyer("Fashion Hub", "fashion@example.com", "2345678901", "Clothing Retail"),
                createBuyer("Home Decor LLC", "homedecor@example.com", "3456789012", "Home Goods Retail"),
                createBuyer("Book World", "books@example.com", "4567890123", "Bookstore"),
                createBuyer("Gourmet Foods", "foods@example.com", "5678901234", "Food Retail")
        );

        // Create 5 suppliers with warehouses and assign existing products
        List<Company> suppliers = Arrays.asList(
                // Global Electronics - gets electronics products (IDs 6-10 - fragrances)
                createSupplierWithProducts("Global Electronics", "electronics@example.com", "6789012345",
                        Arrays.asList(6L, 7L, 8L, 9L, 10L)),

                // Textile Manufacturers - gets beauty products (IDs 1-5)
                createSupplierWithProducts("Textile Manufacturers", "textile@example.com", "7890123456",
                        Arrays.asList(1L, 2L, 3L, 4L, 5L)),

                // Furniture Makers Co - gets furniture products (IDs 11-15)
                createSupplierWithProducts("Furniture Makers Co", "furniture@example.com", "8901234567",
                        Arrays.asList(11L, 12L, 13L, 14L, 15L)),

                // Paper Products Ltd - gets some beauty and grocery products
                createSupplierWithProducts("Paper Products Ltd", "paper@example.com", "9012345678",
                        Arrays.asList(4L, 5L, 16L, 17L)),

                // Fresh Produce Distributors - gets grocery products (IDs 16-19)
                createSupplierWithProducts("Fresh Produce Distributors", "produce@example.com", "0123456789",
                        Arrays.asList(16L, 17L, 18L, 19L))
        );

        companyRepository.saveAll(buyers);
        companyRepository.saveAll(suppliers);
    }

    private Company createBuyer(String name, String email, String phone, String businessType) {
        Company company = new Company();
        company.setCompanyName(name);
        company.setEmail(email);
        company.setPhoneNumber(phone);
        company.setBusinessType(businessType);
        company.setAddress(createAddress());

        // Set manager with ID 1 (assuming this user exists)
        User manager = new User();
        manager.setId(1L);
        company.setManager(manager);

        return company;
    }

    private Company createSupplierWithProducts(String name, String email, String phone, List<Long> productIds) {
        Company company = new Company();
        company.setCompanyName(name);
        company.setEmail(email);
        company.setPhoneNumber(phone);
        company.setAddress(createAddress());

        // Set manager with ID 1 (assuming this user exists)
        User manager = new User();
        manager.setId(1L);
        company.setManager(manager);

        // Create warehouse and add products
        Warehouse warehouse = new Warehouse();
        warehouse.setName(name + " Main Warehouse");
        warehouse.setAddress(createAddress());

        // Add products to warehouse with realistic random quantities
        for (Long productId : productIds) {
            Product product = new Product();
            product.setId(productId);

            WarehouseProduct warehouseProduct = new WarehouseProduct();
            warehouseProduct.setProduct(product);

            // Generate realistic random quantity based on product category
            warehouseProduct.setQuantity(generateRealisticQuantity(productId));
            warehouseProduct.setWarehouse(warehouse);
            warehouse.addWarehouseProduct(warehouseProduct);
        }

        company.addWarehouse(warehouse);

        return company;
    }

    private int generateRealisticQuantity(Long productId) {
        Random random = new Random();

        if (productId >= 1 && productId <= 5) {
            return 50 + random.nextInt(150);
        } else if (productId >= 6 && productId <= 10) {
            return 20 + random.nextInt(80);
        } else if (productId >= 11 && productId <= 15) {
            return 5 + random.nextInt(15);
        } else if (productId >= 16 && productId <= 19) {
            return 200 + random.nextInt(300);
        } else {
            return 10 + random.nextInt(90);
        }
    }

    private Address createAddress() {
        City city = new City();
        city.setId(70674L);
        Address address = new Address();
        address.setStreet("123 Main St");
        address.setCity(city);
        address.setPostalCode("10001");
        return address;
    }
}