package com.example.split.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class GroupRequest {

    @NotBlank
    private String name;

    @NotEmpty
    private List<Long> memberIds;
}