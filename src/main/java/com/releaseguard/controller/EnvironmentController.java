package com.releaseguard.controller;

import com.releaseguard.model.Environment;
import com.releaseguard.repository.EnvironmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/environments")
public class EnvironmentController {

    private final EnvironmentRepository environmentRepository;

    public EnvironmentController(EnvironmentRepository environmentRepository) {
        this.environmentRepository = environmentRepository;
    }

    @GetMapping
    public List<Environment> getAll() {
        return environmentRepository.findAll();
    }

    @PostMapping
    public Environment create(@RequestBody Environment environment) {
        return environmentRepository.save(environment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Environment> update(@PathVariable UUID id, @RequestBody Environment incoming) {
        return environmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(incoming.getName());
                    existing.setDisplayOrder(incoming.getDisplayOrder());
                    existing.setJdbcUrl(incoming.getJdbcUrl());
                    existing.setDbUser(incoming.getDbUser());
                    existing.setDbPassword(incoming.getDbPassword());
                    return ResponseEntity.ok(environmentRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!environmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        environmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, String>> testConnection(@PathVariable UUID id) {
        return environmentRepository.findById(id)
                .map(env -> {
                    try (Connection conn = DriverManager.getConnection(
                            env.getJdbcUrl(), env.getDbUser(), env.getDbPassword())) {
                        return ResponseEntity.ok(Map.of(
                                "status", "success",
                                "message", "Connection established successfully"
                        ));
                    } catch (SQLException e) {
                        return ResponseEntity.ok(Map.of(
                                "status", "failure",
                                "message", e.getMessage()
                        ));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
