package com.stockly.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_reviews")
@Getter
@Setter
public class ProductReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "comment")
    private String comment;

    @Column(name = "date")
    private Instant date;

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "reviewer_email")
    private String reviewerEmail;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
