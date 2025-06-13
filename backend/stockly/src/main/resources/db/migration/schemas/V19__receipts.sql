CREATE TABLE receipts (
    order_id BIGINT PRIMARY KEY,
    order_date TIMESTAMP,
    delivery_date TIMESTAMP,
    status VARCHAR(255),

    -- Foreign key references
    buyer_id BIGINT,
    supplier_id BIGINT,
    destination_warehouse_id BIGINT,
    source_warehouse_id BIGINT,

    -- Buyer historical snapshot
    buyer_company_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_phone_number VARCHAR(50),
    buyer_address TEXT,
    buyer_company_type VARCHAR(100),
    buyer_manager_id BIGINT,
    buyer_manager_name VARCHAR(255),
    buyer_manager_email VARCHAR(255),
    destination_warehouse_name VARCHAR(255),
    destination_warehouse_address TEXT,

    -- Supplier historical snapshot
    supplier_company_name VARCHAR(255),
    supplier_email VARCHAR(255),
    supplier_phone_number VARCHAR(50),
    supplier_address TEXT,
    supplier_company_type VARCHAR(100),
    supplier_manager_id BIGINT,
    supplier_manager_name VARCHAR(255),
    supplier_manager_email VARCHAR(255),
    source_warehouse_name VARCHAR(255),
    source_warehouse_address TEXT,

    total_price NUMERIC(19, 2),

    -- Foreign key constraints
    CONSTRAINT fk_receipts_buyer FOREIGN KEY (buyer_id) REFERENCES company(id),
    CONSTRAINT fk_receipts_supplier FOREIGN KEY (supplier_id) REFERENCES company(id),
    CONSTRAINT fk_receipts_dest_warehouse FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_receipts_source_warehouse FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id)
);