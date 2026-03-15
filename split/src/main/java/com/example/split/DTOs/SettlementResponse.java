package com.example.split.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SettlementResponse {
    private Long payerId;
    private String payerName;
    private Long payeeId;
    private String payeeName;
    private BigDecimal amount;
}