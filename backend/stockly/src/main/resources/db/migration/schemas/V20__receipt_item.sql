CREATE TABLE receipt_items (
    id SERIAL PRIMARY KEY,

    product_title VARCHAR(255),
    product_sku VARCHAR(100),
    product_thumbnail TEXT,

    quantity INTEGER,
    unit_price NUMERIC(19, 2),
    total_price NUMERIC(19, 2),

    receipt_id BIGINT,
    product_id BIGINT,

    CONSTRAINT fk_receipt_items_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_receipt_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);