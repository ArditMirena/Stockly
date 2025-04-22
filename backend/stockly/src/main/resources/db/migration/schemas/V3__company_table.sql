CREATE TABLE company (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    manager_id BIGINT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50) UNIQUE,
    address_id BIGINT,
    company_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    business_type VARCHAR(100),

    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES users(id),
    CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES address(id)
);