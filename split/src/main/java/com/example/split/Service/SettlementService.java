package com.example.split.Service;

import com.example.split.DTOs.SettlementResponse;
import com.example.split.Entities.*;
import com.example.split.Exception.ResourceNotFoundException;
import com.example.split.Repository.SettlementRepository;
import com.example.split.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;
    private final DebtSimplificationService debtSimplificationService;

    public List<SettlementResponse> getSettlementPlan(Long groupId) {
        return debtSimplificationService.simplifyDebts(groupService.getGroupById(groupId));
    }

    public Settlement recordSettlement(Long groupId, Long payerId, Long payeeId, BigDecimal amount) {
        return settlementRepository.save(Settlement.builder()
                .group(groupService.getGroupById(groupId))
                .payer(userRepository.findById(payerId).orElseThrow(() -> new ResourceNotFoundException("Payer not found")))
                .payee(userRepository.findById(payeeId).orElseThrow(() -> new ResourceNotFoundException("Payee not found")))
                .amount(amount).date(LocalDate.now()).settled(true).build());
    }

    public List<Settlement> getSettlementsForGroup(Long groupId) {
        return settlementRepository.findByGroup(groupService.getGroupById(groupId));
    }
}