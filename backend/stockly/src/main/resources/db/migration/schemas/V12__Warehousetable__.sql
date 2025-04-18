CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),

    address_id BIGINT UNIQUE,
    company_id BIGINT,

    CONSTRAINT fk_warehouse_address FOREIGN KEY (address_id) REFERENCES address(id),
    CONSTRAINT fk_warehouse_company FOREIGN KEY (company_id) REFERENCES company(id)
);
