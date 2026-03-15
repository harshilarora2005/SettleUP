package com.example.split.Service;

import com.example.split.config.JwtUtil;
import com.example.split.DTOs.AuthResponse;
import com.example.split.DTOs.LoginRequest;
import com.example.split.DTOs.ExpenseRequest;
import com.example.split.Entities.User;
import com.splitwise.exception.ResourceNotFoundException;
import com.splitwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getName(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getName(), user.getEmail());
    }
}