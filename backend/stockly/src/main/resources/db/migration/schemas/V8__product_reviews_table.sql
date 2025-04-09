CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER,
    comment TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    reviewer_name VARCHAR(100),
    reviewer_email VARCHAR(100)
)