ALTER TABLE company
    DROP COLUMN address,
    ADD COLUMN address_id BIGINT,
    ADD CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES address(id);