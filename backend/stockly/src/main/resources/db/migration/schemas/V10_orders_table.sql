CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    source_warehouse_id BIGINT,
    destination_warehouse_id BIGINT,
    order_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    shipment_id VARCHAR(255) NULL,
    total_price DECIMAL(19,4) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(250),
    source_warehouse_name VARCHAR(255),
    destination_warehouse_name VARCHAR(255),

    CONSTRAINT fk_order_buyer
        FOREIGN KEY (buyer_id) REFERENCES company(id),
    CONSTRAINT fk_order_supplier
        FOREIGN KEY (supplier_id) REFERENCES company(id),
    CONSTRAINT fk_order_sourceWarehouse
        FOREIGN KEY (source_warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_order_destinationWarehouse
        FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT chk_status
    CHECK (status IN ('CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
);