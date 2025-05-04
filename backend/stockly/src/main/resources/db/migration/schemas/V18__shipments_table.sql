CREATE TABLE shipments (
   id BIGSERIAL PRIMARY KEY,
   order_id BIGINT NOT NULL,
   from_address_id BIGINT NOT NULL,
   to_address_id BIGINT NOT NULL,
   carrier VARCHAR(50),
   tracking_number VARCHAR(100),
   label_url VARCHAR(512),
   status VARCHAR(50),
   estimated_delivery_date TIMESTAMP,
   shipping_cost DECIMAL(19, 4),
   created_at TIMESTAMP NOT NULL,
   updated_at TIMESTAMP NOT NULL,
   easypost_shipment_id VARCHAR(255),
   CONSTRAINT fk_shipment_order FOREIGN KEY (order_id) REFERENCES orders(id),
   CONSTRAINT fk_shipment_from_address FOREIGN KEY (from_address_id) REFERENCES address(id),
   CONSTRAINT fk_shipment_to_address FOREIGN KEY (to_address_id) REFERENCES address(id)
);