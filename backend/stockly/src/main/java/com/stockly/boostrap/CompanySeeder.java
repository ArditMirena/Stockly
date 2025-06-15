package com.stockly.boostrap;

import com.stockly.model.*;
import com.stockly.repository.CompanyRepository;
import com.stockly.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

@Component
@Order(1)
public class CompanySeeder implements CommandLineRunner {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    private final Map<String, String[]> COMPANY_NAMES_BY_INDUSTRY = Map.of(
            "Technology", new String[]{
                    "Quantum Computing Inc", "Neuralink Technologies", "Blockchain Innovations",
                    "Cloud Nexus Solutions", "AI Dynamics", "CyberSecure Systems",
                    "DataForge Analytics", "NanoTech Enterprises", "Virtual Reality Labs",
                    "Silicon Valley Robotics"
            },
            "Fashion", new String[]{
                    "Elegance Couture", "Urban Threads Apparel", "Luxury Stitch",
                    "Denim & Co", "Silk Road Fashion", "Vintage Revival",
                    "EcoChic Clothing", "Runway Essentials", "Haute Cotton",
                    "The Trendsetters"
            },
            "Food & Beverage", new String[]{
                    "Organic Harvest", "Gourmet Delights", "Farm-to-Table Foods",
                    "Beverage Masters", "Artisan Bakery Co", "Pure Juice Company",
                    "Sustainable Seafood", "Mountain Spring Waters", "Ethical Coffee Roasters",
                    "Gluten-Free Kitchen"
            },
            "Automotive", new String[]{
                    "Precision Auto Parts", "EcoDrive Motors", "Turbo Performance",
                    "Luxury Auto Group", "Classic Car Restorations", "Electric Vehicle Innovations",
                    "AutoTech Solutions", "Future Mobility", "Hybrid Engine Specialists",
                    "AeroDynamic Motors"
            },
            "Electronics", new String[]{
                    "Circuit Master", "VoltAge Electronics", "Quantum Components",
                    "Precision Instruments", "Future Gadgets", "Smart Home Tech",
                    "AudioVisual Experts", "RoboTech Systems", "NanoElectronics",
                    "Virtual Interface Co"
            },
            "Furniture", new String[]{
                    "Artisan Woodcraft", "Modern Living Spaces", "EcoFurnish Designs",
                    "Office Pro Solutions", "Luxury Interiors", "Compact Living",
                    "Handcrafted Oak", "Sustainable Furniture Co", "ErgoComfort",
                    "Bamboo Creations"
            }
    );

    private final String[] WAREHOUSE_TYPES = {
            "Distribution Center", "Logistics Hub", "Storage Facility",
            "Fulfillment Center", "Inventory Warehouse", "Regional Depot",
            "Main Warehouse", "Cold Storage", "Bulk Storage"
    };

    private final String[] WAREHOUSE_LOCATIONS = {
            "North", "South", "East", "West", "Central",
            "Metropolitan", "Coastal", "Mountain", "Industrial"
    };

    public CompanySeeder(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (companyRepository.count() == 0) {
            seedCompanies();
        }
    }

    private void seedCompanies() {
        List<Company> allCompanies = new ArrayList<>();
        List<Long> allProductIds = IntStream.rangeClosed(1, 100)
                .mapToLong(i -> i)
                .boxed()
                .toList();

        // Get users with specific roles
        User buyerManager = userRepository.findByEmail("buyer@email.com")
                .orElseThrow(() -> new RuntimeException("Buyer user not found"));
        User supplierManager = userRepository.findByEmail("supplier@email.com")
                .orElseThrow(() -> new RuntimeException("Supplier user not found"));

        // Create buyers (5 per industry)
        COMPANY_NAMES_BY_INDUSTRY.forEach((industry, names) -> {
            Arrays.stream(names)
                    .limit(5)
                    .forEach(name -> allCompanies.add(createBuyer(
                            name,
                            generateEmail(name),
                            generatePhoneNumber(),
                            industry + " Retail",
                            buyerManager
                    )));
        });

        // Create suppliers (3 per industry)
        COMPANY_NAMES_BY_INDUSTRY.forEach((industry, names) -> {
            Arrays.stream(names)
                    .skip(5)
                    .limit(3)
                    .forEach(name -> {
                        List<Long> productIds = selectProductIds(allProductIds, 15, industry);
                        allCompanies.add(createSupplierWithWarehouses(
                                name,
                                generateEmail(name),
                                generatePhoneNumber(),
                                productIds,
                                ThreadLocalRandom.current().nextInt(1, 4), // 1-3 warehouses
                                supplierManager
                        ));
                    });
        });

        // Create manufacturers (2 per industry)
        COMPANY_NAMES_BY_INDUSTRY.forEach((industry, names) -> {
            Arrays.stream(names)
                    .skip(8)
                    .limit(2)
                    .forEach(name -> {
                        List<Long> productIds = selectProductIds(allProductIds, 20, industry);
                        allCompanies.add(createManufacturerWithWarehouses(
                                name,
                                generateEmail(name),
                                generatePhoneNumber(),
                                productIds,
                                ThreadLocalRandom.current().nextInt(2, 4), // 2-3 warehouses
                                supplierManager
                        ));
                    });
        });

        companyRepository.saveAll(allCompanies);
    }

    private Company createBuyer(String name, String email, String phone, String businessType, User manager) {
        Company company = new Company();
        company.setCompanyName(name);
        company.setEmail(email);
        company.setPhoneNumber(phone);
        company.setBusinessType(businessType);
        company.setAddress(createRandomAddress());
        company.setManager(manager);
        return company;
    }

    private Company createSupplierWithWarehouses(String name, String email, String phone,
                                                 List<Long> productIds, int warehouseCount, User manager) {
        Company company = new Company();
        company.setCompanyName(name);
        company.setEmail(email);
        company.setPhoneNumber(phone);
        company.setAddress(createRandomAddress());
        company.setManager(manager);

        // Create warehouses
        for (int i = 1; i <= warehouseCount; i++) {
            Warehouse warehouse = new Warehouse();
            warehouse.setName(generateWarehouseName(name, i));
            warehouse.setAddress(createRandomAddress());

            // Distribute products across warehouses
            int productsPerWarehouse = productIds.size() / warehouseCount;
            int start = (i - 1) * productsPerWarehouse;
            int end = (i == warehouseCount) ? productIds.size() : i * productsPerWarehouse;

            for (Long productId : productIds.subList(start, end)) {
                Product product = new Product();
                product.setId(productId);

                WarehouseProduct warehouseProduct = new WarehouseProduct();
                warehouseProduct.setProduct(product);
                warehouseProduct.setQuantity(generateRealisticQuantity(productId, company.getCompanyName()));
                warehouseProduct.setWarehouse(warehouse);

                warehouse.addWarehouseProduct(warehouseProduct);
            }

            company.addWarehouse(warehouse);
        }

        return company;
    }

    private Company createManufacturerWithWarehouses(String name, String email, String phone,
                                                     List<Long> productIds, int warehouseCount, User manager) {
        Company company = new Company();
        company.setCompanyName(name);
        company.setEmail(email);
        company.setPhoneNumber(phone);
        company.setAddress(createRandomAddress());
        company.setHasProductionFacility(true);
        company.setManager(manager);

        // Create warehouses
        for (int i = 1; i <= warehouseCount; i++) {
            Warehouse warehouse = new Warehouse();
            warehouse.setName(generateWarehouseName(name, i));
            warehouse.setAddress(createRandomAddress());

            // Distribute products across warehouses
            int productsPerWarehouse = productIds.size() / warehouseCount;
            int start = (i - 1) * productsPerWarehouse;
            int end = (i == warehouseCount) ? productIds.size() : i * productsPerWarehouse;

            for (Long productId : productIds.subList(start, end)) {
                Product product = new Product();
                product.setId(productId);

                WarehouseProduct warehouseProduct = new WarehouseProduct();
                warehouseProduct.setProduct(product);
                warehouseProduct.setQuantity(generateRealisticQuantity(productId, company.getCompanyName()));
                warehouseProduct.setWarehouse(warehouse);

                warehouse.addWarehouseProduct(warehouseProduct);
            }

            company.addWarehouse(warehouse);
        }

        return company;
    }

    private String generateWarehouseName(String companyName, int warehouseNumber) {
        String type = WAREHOUSE_TYPES[ThreadLocalRandom.current().nextInt(WAREHOUSE_TYPES.length)];
        String location = WAREHOUSE_LOCATIONS[ThreadLocalRandom.current().nextInt(WAREHOUSE_LOCATIONS.length)];
        return String.format("%s %s #%d (%s)", companyName, type, warehouseNumber, location);
    }

    private List<Long> selectProductIds(List<Long> allProductIds, int count, String industry) {
        // Select product IDs based on industry
        int start, end;
        switch (industry) {
            case "Technology":
            case "Electronics":
                start = 1; end = 20; break;
            case "Fashion":
                start = 21; end = 40; break;
            case "Food & Beverage":
                start = 41; end = 60; break;
            case "Automotive":
                start = 61; end = 80; break;
            case "Furniture":
                start = 81; end = 100; break;
            default:
                start = 1; end = 100;
        }

        List<Long> industryProducts = new ArrayList<>(allProductIds.subList(start - 1, end));
        Collections.shuffle(industryProducts);
        return industryProducts.subList(0, Math.min(count, industryProducts.size()));
    }

    private int generateRealisticQuantity(Long productId, String companyName) {
        // Base quantity on product type and company size
        int baseQuantity;
        if (productId <= 20) {    // Small items
            baseQuantity = 50 + ThreadLocalRandom.current().nextInt(150);
        } else if (productId <= 40) {  // Medium items
            baseQuantity = 20 + ThreadLocalRandom.current().nextInt(80);
        } else if (productId <= 60) {  // Large items
            baseQuantity = 5 + ThreadLocalRandom.current().nextInt(15);
        } else {                       // Bulk items
            baseQuantity = 200 + ThreadLocalRandom.current().nextInt(300);
        }

        // Adjust based on company type
        if (companyName.contains("Manufacturer")) {
            return baseQuantity * 3;
        } else if (companyName.contains("Supplier")) {
            return baseQuantity * 2;
        }
        return baseQuantity;
    }

    private Address createRandomAddress() {
        City city = new City();
        city.setId(70674L + ThreadLocalRandom.current().nextLong(100)); // Random nearby cities

        Address address = new Address();
        address.setStreet(ThreadLocalRandom.current().nextInt(100, 999) + " " +
                new String[]{"Main", "Oak", "Pine", "Maple", "Cedar", "Elm"}[ThreadLocalRandom.current().nextInt(6)] +
                " " + new String[]{"St", "Ave", "Blvd", "Dr", "Way"}[ThreadLocalRandom.current().nextInt(5)]);
        address.setCity(city);
        address.setPostalCode(String.valueOf(10000 + ThreadLocalRandom.current().nextInt(90000)));
        return address;
    }

    private String generateEmail(String companyName) {
        return companyName.toLowerCase()
                .replaceAll("[^a-z0-9]", "") + "@example.com";
    }

    private String generatePhoneNumber() {
        return String.format("(%03d) %03d-%04d",
                ThreadLocalRandom.current().nextInt(200, 999),
                ThreadLocalRandom.current().nextInt(100, 999),
                ThreadLocalRandom.current().nextInt(1000, 9999));
    }
}