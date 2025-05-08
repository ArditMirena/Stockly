CREATE TABLE receipts (
    order_id BIGINT PRIMARY KEY,
    order_date TIMESTAMP,
    delivery_date TIMESTAMP,
    status VARCHAR(255),

    buyer_id BIGINT,
    supplier_id BIGINT,

    buyer_company_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_phone_number VARCHAR(50),
    buyer_address TEXT,
    buyer_company_type VARCHAR(100),

    supplier_company_name VARCHAR(255),
    supplier_email VARCHAR(255),
    supplier_phone_number VARCHAR(50),
    supplier_address TEXT,
    supplier_company_type VARCHAR(100),

    total_price NUMERIC(19, 2),

    CONSTRAINT fk_receipts_buyer FOREIGN KEY (buyer_id) REFERENCES company(id),
    CONSTRAINT fk_receipts_supplier FOREIGN KEY (supplier_id) REFERENCES company(id)
);
