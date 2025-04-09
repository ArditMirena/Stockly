CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT
)