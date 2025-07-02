CREATE TABLE role_requests
(
    id       SERIAL PRIMARY KEY,
    user_id  BIGINT  NOT NULL,
    role_id  BIGINT  NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);