package com.stockly.model.enums;

public enum OrderStatus {
    CREATED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    // Optional: Helper method to check if status is terminal
    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }
}