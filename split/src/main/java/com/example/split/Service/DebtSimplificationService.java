package com.example.split.Service;

import com.example.split.DTOs.SettlementResponse;
import com.example.split.Entities.*;
import com.example.split.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DebtSimplificationService {

    private final UserRepository userRepository;

    public Map<Long, BigDecimal> calculateNetBalances(Group group) {
        Map<Long, BigDecimal> balances = new HashMap<>();
        for (User member : group.getMembers()) balances.put(member.getId(), BigDecimal.ZERO);

        for (Expense expense : group.getExpenses()) {
            Long payerId = expense.getPaidBy().getId();
            for (ExpenseSplit split : expense.getSplits()) {
                Long debtorId = split.getUser().getId();
                BigDecimal share = split.getShareAmount();
                if (!debtorId.equals(payerId)) {
                    balances.merge(payerId, share, BigDecimal::add);
                    balances.merge(debtorId, share.negate(), BigDecimal::add);
                }
            }
        }
        return balances;
    }

    public List<SettlementResponse> simplifyDebts(Group group) {
        Map<Long, BigDecimal> balances = calculateNetBalances(group);
        Map<Long, User> userMap = new HashMap<>();
        for (User m : group.getMembers()) userMap.put(m.getId(), m);

        PriorityQueue<long[]> creditors = new PriorityQueue<>((a, b) -> Long.compare(b[1], a[1]));
        PriorityQueue<long[]> debtors   = new PriorityQueue<>((a, b) -> Long.compare(a[1], b[1]));

        for (Map.Entry<Long, BigDecimal> e : balances.entrySet()) {
            long scaled = e.getValue().multiply(BigDecimal.valueOf(100)).longValue();
            if (scaled > 0) creditors.offer(new long[]{e.getKey(), scaled});
            else if (scaled < 0) debtors.offer(new long[]{e.getKey(), scaled});
        }

        List<SettlementResponse> result = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            long[] creditor = creditors.poll();
            long[] debtor   = debtors.poll();
            long settle = Math.min(creditor[1], -debtor[1]);
            BigDecimal amount = BigDecimal.valueOf(settle).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            User payer = userMap.get(debtor[0]);
            User payee = userMap.get(creditor[0]);
            result.add(new SettlementResponse(payer.getId(), payer.getName(), payee.getId(), payee.getName(), amount));
            creditor[1] -= settle;
            debtor[1]   += settle;
            if (creditor[1] > 0) creditors.offer(creditor);
            if (debtor[1]   < 0) debtors.offer(debtor);
        }
        return result;
    }
}