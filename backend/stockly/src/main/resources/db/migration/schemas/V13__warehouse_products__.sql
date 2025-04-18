CREATE TABLE warehouse_products (
    id SERIAL PRIMARY KEY,

    warehouse_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL,
    availability VARCHAR(50) NOT NULL,

    CONSTRAINT fk_wp_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    CONSTRAINT fk_wp_product FOREIGN KEY (product_id) REFERENCES products(id)
);