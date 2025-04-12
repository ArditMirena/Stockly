CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    order_date TIMESTAMP NOT NULL,
    delivery_date TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    total_price DECIMAL(19,4) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_buyer
    FOREIGN KEY (buyer_id) REFERENCES company(id),
    CONSTRAINT fk_order_supplier
    FOREIGN KEY (supplier_id) REFERENCES company(id),

    CONSTRAINT chk_status
    CHECK (status IN ('CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
);