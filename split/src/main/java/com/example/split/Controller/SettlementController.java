package com.example.split.Controller;

import com.example.split.DTOs.SettlementResponse;
import com.example.split.Entities.Settlement;
import com.example.split.Service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<SettlementResponse>> getSettlementPlan(@PathVariable Long groupId) {
        return ResponseEntity.ok(settlementService.getSettlementPlan(groupId));
    }

    @PostMapping("/record")
    public ResponseEntity<Settlement> recordSettlement(@RequestParam Long groupId,
                                                       @RequestParam Long payerId, @RequestParam Long payeeId, @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(settlementService.recordSettlement(groupId, payerId, payeeId, amount));
    }

    @GetMapping("/group/{groupId}/history")
    public ResponseEntity<List<Settlement>> getSettlementHistory(@PathVariable Long groupId) {
        return ResponseEntity.ok(settlementService.getSettlementsForGroup(groupId));
    }
}