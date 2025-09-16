package com.example.salary_service.controller;

import com.example.salary_service.model.Salary;
import com.example.salary_service.repository.SalaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/salaries")
public class SalaryController {

    @Autowired
    private SalaryRepository salaryRepository;

    @GetMapping
    public List<Salary> getAllSalaries() {
        return salaryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Salary> getSalaryById(@PathVariable Long id) {
        Optional<Salary> salary = salaryRepository.findById(id);
        return salary.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Salary createSalary(@RequestBody Salary salary) {
        return salaryRepository.save(salary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Salary> updateSalary(@PathVariable Long id, @RequestBody Salary salaryDetails) {
        Optional<Salary> salary = salaryRepository.findById(id);
        if (salary.isPresent()) {
            Salary existingSalary = salary.get();
            existingSalary.setAmount(salaryDetails.getAmount());
            existingSalary.setCurrency(salaryDetails.getCurrency());
            Salary updatedSalary = salaryRepository.save(existingSalary);
            return ResponseEntity.ok(updatedSalary);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalary(@PathVariable Long id) {
        if (salaryRepository.existsById(id)) {
            salaryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}