package com.stockly.exception;

public class CustomException extends RuntimeException {
  private final CustomError error;

  public CustomException(CustomError error) {
    super(error.getMessage());
    this.error = error;
  }
};
