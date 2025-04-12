CREATE TABLE order_items (
                             id BIGSERIAL PRIMARY KEY,
                             order_id BIGINT NOT NULL,
                             product_id BIGINT NOT NULL,
                             quantity INTEGER NOT NULL CHECK (quantity > 0),
                             unit_price DECIMAL(19,4) NOT NULL CHECK (unit_price > 0),
                             total_price DECIMAL(19,4) NOT NULL CHECK (total_price > 0),

                             CONSTRAINT fk_order_item_order
                                 FOREIGN KEY (order_id) REFERENCES orders(id),
                             CONSTRAINT fk_order_item_product
                                 FOREIGN KEY (product_id) REFERENCES products(id)
);
