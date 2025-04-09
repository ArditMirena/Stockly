CREATE TABLE product_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE product_tag_mapping (
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES product_tags(id) ON Delete CASCADE,
    PRIMARY KEY (product_id, tag_id)
)