package com.example.split.Service;

import com.example.split.DTOs.ExpenseRequest;
import com.example.split.Entities.Expense;
import com.example.split.Entities.ExpenseSplit;
import com.example.split.Entities.Group;
import com.example.split.Entities.User;
import com.example.split.Repository.ExpenseRepository;
import com.example.split.Repository.UserRepository;
import com.example.split.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;

    @Transactional
    public Expense addExpense(ExpenseRequest request, String payerEmail) {
        User paidBy = userRepository.findByEmail(payerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Group group = groupService.getGroupById(request.getGroupId());

        Expense expense = Expense.builder()
                .group(group).paidBy(paidBy).amount(request.getAmount())
                .description(request.getDescription()).category(request.getCategory())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .build();

        List<ExpenseSplit> splits = new ArrayList<>();
        if (request.getSplits() == null || request.getSplits().isEmpty()) {
            List<User> members = new ArrayList<>(group.getMembers());
            BigDecimal equalShare = request.getAmount()
                    .divide(BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);
            for (User member : members) {
                splits.add(ExpenseSplit.builder().expense(expense).user(member).shareAmount(equalShare).build());
            }
        } else {
            for (ExpenseRequest.SplitDetail detail : request.getSplits()) {
                User member = userRepository.findById(detail.getUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + detail.getUserId()));
                splits.add(ExpenseSplit.builder().expense(expense).user(member).shareAmount(detail.getShareAmount()).build());
            }
        }
        expense.setSplits(splits);
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesByGroup(Long groupId) {
        return expenseRepository.findByGroupOrderByDateDesc(groupService.getGroupById(groupId));
    }

    public void deleteExpense(Long expenseId) {
        expenseRepository.delete(expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + expenseId)));
    }
}