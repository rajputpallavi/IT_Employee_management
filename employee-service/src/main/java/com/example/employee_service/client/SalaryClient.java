package com.example.employee_service.client;

import com.example.employee_service.dto.SalaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "salary-service")
public interface SalaryClient {

    @GetMapping("/api/salaries/{id}")
    SalaryDto getSalaryById(@PathVariable Long id);
}