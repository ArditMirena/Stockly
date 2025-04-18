CREATE TABLE address (
                         id SERIAL PRIMARY KEY,
                         street VARCHAR(255) NOT NULL,
                         postalcode VARCHAR(20),
                         city_id BIGINT,
                         FOREIGN KEY (city_id) REFERENCES city(id)
);