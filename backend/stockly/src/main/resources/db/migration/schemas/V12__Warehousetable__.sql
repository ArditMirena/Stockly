CREATE TABLE warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    manager_id BIGINT,
    availability_status VARCHAR(255)
);
