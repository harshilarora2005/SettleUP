package com.example.split.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ExpenseRequest {

    @NotNull
    private Long groupId;

    @NotNull @Positive
    private BigDecimal amount;

    @NotBlank
    private String description;

    private String category;
    private LocalDate date;
    private Long paidById;

    private List<SplitDetail> splits;

    @Data
    public static class SplitDetail {
        private Long userId;
        private BigDecimal shareAmount;
    }
}