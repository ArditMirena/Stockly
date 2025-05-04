CREATE TABLE country (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    iso_code VARCHAR(2) UNIQUE
);
