CREATE TABLE city (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    country_id BIGINT,
    CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES country(id)
);
