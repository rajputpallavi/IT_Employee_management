package com.example.employee_service.service;

import com.example.employee_service.client.DepartmentClient;
import com.example.employee_service.client.SalaryClient;
import com.example.employee_service.model.Employee;
import com.example.employee_service.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentClient departmentClient;

    @Autowired
    private SalaryClient salaryClient;

    public Optional<Employee> getEmployeeWithDetails(Long id) {
        Optional<Employee> employeeOptional = employeeRepository.findById(id);

        if (employeeOptional.isPresent()) {
            Employee employee = employeeOptional.get();

            // Fetch details from other services using Feign Clients
            employee.setDepartment(departmentClient.getDepartmentById(employee.getDepartmentId()));
            employee.setSalary(salaryClient.getSalaryById(employee.getSalaryId()));
            return Optional.of(employee);
        }

        return Optional.empty();
    }
}