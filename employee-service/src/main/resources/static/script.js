// API Base URLs
const API_EMPLOYEE_URL = 'http://localhost:8081/api/employees';
const API_DEPARTMENT_URL = 'http://localhost:8082/api/departments';
const API_SALARY_URL = 'http://localhost:8083/api/salaries';

// State variables for tracking
let currentSection = 'employees';
let currentItemId = null;
let currentItemType = null;
let allEmployees = [];

// --- SECTION SWITCHING ---
function showSection(sectionId) {
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');

    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white', 'hover:bg-gray-200');
        btn.classList.add('hover:bg-gray-200');
    });
    document.getElementById(`nav-${sectionId.replace('-section', '')}`).classList.add('bg-blue-500', 'text-white');
    currentSection = sectionId.replace('-section', '');

    // Fetch data for the new section
    if (currentSection === 'employees') {
        fetchEmployees();
    } else if (currentSection === 'departments') {
        fetchDepartments();
    } else if (currentSection === 'salaries') {
        fetchSalaries();
    }
}

// --- GENERAL MODAL FUNCTIONS ---
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showDeleteModal(id, type) {
    currentItemId = id;
    currentItemType = type;
    document.getElementById('delete-message').textContent = `Are you sure you want to delete this ${type}?`;
    document.getElementById('delete-modal').style.display = 'flex';
}

async function handleConfirmDelete() {
    let url;
    if (currentItemType === 'employee') {
        url = `${API_EMPLOYEE_URL}/${currentItemId}`;
    } else if (currentItemType === 'department') {
        url = `${API_DEPARTMENT_URL}/${currentItemId}`;
    } else if (currentItemType === 'salary') {
        url = `${API_SALARY_URL}/${currentItemId}`;
    }

    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        closeModal('delete-modal');
        // Reload the correct section
        if (currentItemType === 'employee') fetchEmployees();
        if (currentItemType === 'department') fetchDepartments();
        if (currentItemType === 'salary') fetchSalaries();
    } catch (error) {
        console.error(`Error deleting ${currentItemType}:`, error);
        alert(`An error occurred while deleting the ${currentItemType}. See console for details.`);
    }
}

// --- EMPLOYEE SECTION ---
async function fetchEmployees() {
    const tableBody = document.getElementById('employees-table-body');
    try {
        const response = await fetch(API_EMPLOYEE_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allEmployees = await response.json();
        renderEmployees(allEmployees);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error fetching data. Check if backend is running.</td></tr>`;
        console.error("Error fetching employees:", error);
    }
}

function renderEmployees(employeesToRender) {
    const tableBody = document.getElementById('employees-table-body');
    tableBody.innerHTML = '';
    if (employeesToRender.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No employees found.</td></tr>`;
        return;
    }
    employeesToRender.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${employee.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${employee.firstName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${employee.lastName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${employee.email}</td>
            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                <button onclick="viewEmployeeDetails(${employee.id})" class="text-blue-600 hover:text-blue-900 font-medium">View</button>
                <button onclick="showEmployeeModal(${employee.id})" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                <button onclick="showDeleteModal(${employee.id}, 'employee')" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterEmployees() {
    const searchTerm = document.getElementById('employee-search-input').value.toLowerCase();
    const filteredEmployees = allEmployees.filter(employee =>
        employee.firstName.toLowerCase().includes(searchTerm) ||
        employee.lastName.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm)
    );
    renderEmployees(filteredEmployees);
}

async function handleEmployeeFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const employee = Object.fromEntries(formData.entries());
    employee.departmentId = parseInt(employee.departmentId);
    employee.salaryId = parseInt(employee.salaryId);
    
    try {
        let url = API_EMPLOYEE_URL;
        let method = 'POST';
        if (currentItemId) {
            url = `${API_EMPLOYEE_URL}/${currentItemId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        closeModal('employee-modal');
        fetchEmployees();
    } catch (error) {
        console.error("Error saving employee:", error);
        alert("An error occurred while saving the employee. See console for details.");
    }
}

async function fetchDepartmentsAndSalariesForForm() {
    try {
        const [departmentsResponse, salariesResponse] = await Promise.all([
            fetch(API_DEPARTMENT_URL),
            fetch(API_SALARY_URL)
        ]);

        const departments = await departmentsResponse.json();
        const salaries = await salariesResponse.json();

        const departmentSelect = document.getElementById('departmentId');
        const salarySelect = document.getElementById('salaryId');

        // Clear previous options
        departmentSelect.innerHTML = '<option value="">-- Select Department --</option>';
        salarySelect.innerHTML = '<option value="">-- Select Salary --</option>';

        // Populate departments dropdown
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });

        // Populate salaries dropdown
        salaries.forEach(sal => {
            const option = document.createElement('option');
            option.value = sal.id;
            option.textContent = `$${sal.amount} (${sal.currency})`;
            salarySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching data for form:", error);
    }
}

async function showEmployeeModal(id = null) {
    await fetchDepartmentsAndSalariesForForm();
    const modal = document.getElementById('employee-modal');
    const form = document.getElementById('employee-form');
    const title = document.getElementById('employee-modal-title');
    form.reset();
    currentItemId = id;
    if (id) {
        title.textContent = 'Edit Employee';
        const employee = allEmployees.find(emp => emp.id === id);
        document.getElementById('firstName').value = employee.firstName;
        document.getElementById('lastName').value = employee.lastName;
        document.getElementById('email').value = employee.email;
        document.getElementById('departmentId').value = employee.departmentId;
        document.getElementById('salaryId').value = employee.salaryId;
    } else {
        title.textContent = 'Add Employee';
    }
    modal.style.display = 'flex';
}

async function viewEmployeeDetails(id) {
    const detailsModal = document.getElementById('employee-details-modal');
    const detailsContainer = document.getElementById('employee-details-container');
    detailsContainer.innerHTML = '<p class="text-center text-gray-500">Loading details...</p>';
    detailsModal.style.display = 'flex';
    try {
        const response = await fetch(`${API_EMPLOYEE_URL}/details/${id}`);
        if (!response.ok) {
            detailsContainer.innerHTML = '<p class="text-red-500">Error fetching details.</p>';
            return;
        }
        const details = await response.json();
        detailsContainer.innerHTML = `
            <p><strong>First Name:</strong> ${details.firstName}</p>
            <p><strong>Last Name:</strong> ${details.lastName}</p>
            <p><strong>Email:</strong> ${details.email}</p>
            ${details.department ? `
            <div class="mt-4 p-4 rounded-md border border-gray-200">
                <h3 class="font-bold text-lg mb-2">Department Details</h3>
                <p><strong>Name:</strong> ${details.department.name}</p>
                <p><strong>Location:</strong> ${details.department.location}</p>
            </div>
            ` : ''}
            ${details.salary ? `
            <div class="mt-4 p-4 rounded-md border border-gray-200">
                <h3 class="font-bold text-lg mb-2">Salary Details</h3>
                <p><strong>Amount:</strong> $${details.salary.amount}</p>
                <p><strong>Currency:</strong> ${details.salary.currency}</p>
            </div>
            ` : ''}
        `;
    } catch (error) {
        console.error("Error fetching employee details:", error);
        detailsContainer.innerHTML = '<p class="text-red-500">Error fetching details. See console for more info.</p>';
    }
}


// --- DEPARTMENT SECTION ---
async function fetchDepartments() {
    const tableBody = document.getElementById('departments-table-body');
    try {
        const response = await fetch(API_DEPARTMENT_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const departments = await response.json();
        renderDepartments(departments);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error fetching departments. Check if backend is running.</td></tr>`;
        console.error("Error fetching departments:", error);
    }
}

function renderDepartments(departments) {
    const tableBody = document.getElementById('departments-table-body');
    tableBody.innerHTML = '';
    if (departments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No departments found.</td></tr>`;
        return;
    }
    departments.forEach(dept => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${dept.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${dept.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${dept.location}</td>
            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                <button onclick="showDepartmentModal(${dept.id})" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                <button onclick="showDeleteModal(${dept.id}, 'department')" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function handleDepartmentFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const department = Object.fromEntries(formData.entries());

    try {
        let url = API_DEPARTMENT_URL;
        let method = 'POST';
        if (currentItemId) {
            url = `${API_DEPARTMENT_URL}/${currentItemId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(department),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        closeModal('department-modal');
        fetchDepartments();
    } catch (error) {
        console.error("Error saving department:", error);
        alert("An error occurred while saving the department. See console for details.");
    }
}

async function showDepartmentModal(id = null) {
    const modal = document.getElementById('department-modal');
    const form = document.getElementById('department-form');
    const title = document.getElementById('department-modal-title');
    form.reset();
    currentItemId = id;
    if (id) {
        title.textContent = 'Edit Department';
        try {
            const response = await fetch(`${API_DEPARTMENT_URL}/${id}`);
            const department = await response.json();
            document.getElementById('departmentName').value = department.name;
            document.getElementById('departmentLocation').value = department.location;
        } catch (error) {
            console.error("Error fetching department for edit:", error);
        }
    } else {
        title.textContent = 'Add Department';
    }
    modal.style.display = 'flex';
}


// --- SALARY SECTION ---
async function fetchSalaries() {
    const tableBody = document.getElementById('salaries-table-body');
    try {
        const response = await fetch(API_SALARY_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const salaries = await response.json();
        renderSalaries(salaries);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error fetching salaries. Check if backend is running.</td></tr>`;
        console.error("Error fetching salaries:", error);
    }
}

function renderSalaries(salaries) {
    const tableBody = document.getElementById('salaries-table-body');
    tableBody.innerHTML = '';
    if (salaries.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No salaries found.</td></tr>`;
        return;
    }
    salaries.forEach(sal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${sal.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">$${sal.amount}</td>
            <td class="px-6 py-4 whitespace-nowrap">${sal.currency}</td>
            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                <button onclick="showSalaryModal(${sal.id})" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                <button onclick="showDeleteModal(${sal.id}, 'salary')" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function handleSalaryFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const salary = Object.fromEntries(formData.entries());
    salary.amount = parseFloat(salary.amount);

    try {
        let url = API_SALARY_URL;
        let method = 'POST';
        if (currentItemId) {
            url = `${API_SALARY_URL}/${currentItemId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salary),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        closeModal('salary-modal');
        fetchSalaries();
    } catch (error) {
        console.error("Error saving salary:", error);
        alert("An error occurred while saving the salary. See console for details.");
    }
}

async function showSalaryModal(id = null) {
    const modal = document.getElementById('salary-modal');
    const form = document.getElementById('salary-form');
    const title = document.getElementById('salary-modal-title');
    form.reset();
    currentItemId = id;
    if (id) {
        title.textContent = 'Edit Salary';
        try {
            const response = await fetch(`${API_SALARY_URL}/${id}`);
            const salary = await response.json();
            document.getElementById('salaryAmount').value = salary.amount;
            document.getElementById('salaryCurrency').value = salary.currency;
        } catch (error) {
            console.error("Error fetching salary for edit:", error);
        }
    } else {
        title.textContent = 'Add Salary';
    }
    modal.style.display = 'flex';
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-employees').addEventListener('click', () => showSection('employees-section'));
    document.getElementById('nav-departments').addEventListener('click', () => showSection('departments-section'));
    document.getElementById('nav-salaries').addEventListener('click', () => showSection('salaries-section'));

    document.getElementById('add-employee-btn').addEventListener('click', () => showEmployeeModal());
    document.getElementById('add-department-btn').addEventListener('click', () => showDepartmentModal());
    document.getElementById('add-salary-btn').addEventListener('click', () => showSalaryModal());

    document.getElementById('employee-search-input').addEventListener('input', filterEmployees);

    document.getElementById('employee-form').addEventListener('submit', handleEmployeeFormSubmit);
    document.getElementById('department-form').addEventListener('submit', handleDepartmentFormSubmit);
    document.getElementById('salary-form').addEventListener('submit', handleSalaryFormSubmit);

    document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);

    // Initial load
    showSection('employees-section');
});
