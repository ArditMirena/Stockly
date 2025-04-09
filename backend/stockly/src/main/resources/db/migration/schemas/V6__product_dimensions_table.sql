CREATE TABLE product_dimensions (
    id SERIAl PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    width DECIMAL(10, 2),
    height DECIMAL(10, 2),
    depth DECIMAL(10, 2)
)