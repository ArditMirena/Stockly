CREATE TABLE warehouse_products (
    warehouse_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    availability VARCHAR(255) NOT NULL,
    PRIMARY KEY (warehouse_id, product_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
