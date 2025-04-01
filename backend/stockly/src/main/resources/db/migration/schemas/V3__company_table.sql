CREATE TABLE company (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    manager_id BIGINT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(255) UNIQUE,
    address VARCHAR(255),
    company_type VARCHAR(255),
    business_type VARCHAR(255),
    warehouse_id BIGINT,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES "users"(id)
);