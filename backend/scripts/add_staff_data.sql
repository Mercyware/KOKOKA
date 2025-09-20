-- Staff Data Migration Script
-- This script adds sample staff members with different roles and types
-- Some staff members will be designated as teachers

-- Ensure we're working with the right schema
SET SCHEMA 'public';

-- Insert staff members with different roles and types
-- Assuming there's already a school with ID from the seed script

-- First, let's add some users for the staff members
INSERT INTO users (id, email, "passwordHash", name, role, "isActive", "emailVerified", "schoolId") VALUES 
-- Admin Staff
(gen_random_uuid(), 'head.admin@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Robert Wilson', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'finance.manager@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Linda Martinez', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),

-- Teaching Staff
(gen_random_uuid(), 'math.teacher@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Dr. James Thompson', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'science.teacher@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Dr. Maria Rodriguez', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'english.teacher@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Sarah Williams', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'history.teacher@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Michael Davis', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),

-- Support Staff
(gen_random_uuid(), 'librarian@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Emily Chen', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'nurse@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Jennifer Anderson', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'counselor@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'David Kim', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'maintenance@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Carlos Ramirez', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'security@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Thomas Brown', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)),
(gen_random_uuid(), 'reception@greenwood.com', '$2a$10$N9qo8uLOickgx2ZMRJoYUe.CxKVk9eXG3PLZM4/YQz2p4w7O6k3ZO', 'Jessica Lee', 'STAFF', true, true, (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1))

ON CONFLICT (email) DO NOTHING; -- Avoid duplicates

-- Now insert the corresponding staff records
INSERT INTO staff (
    id, 
    "employeeId", 
    "firstName", 
    "lastName", 
    "middleName", 
    "dateOfBirth", 
    gender, 
    phone, 
    "streetAddress", 
    city, 
    state, 
    "zipCode", 
    country, 
    position, 
    "staffType", 
    "joiningDate", 
    salary, 
    status, 
    "schoolId", 
    "userId", 
    "departmentId"
) VALUES
-- Administrative Staff
(gen_random_uuid(), 'ADM001', 'Robert', 'Wilson', NULL, '1975-03-15'::date, 'MALE', '+1-555-0201', '456 Oak Street', 'Springfield', 'California', '90210', 'United States', 'Head Administrator', 'ADMINISTRATOR', '2022-08-01'::date, 75000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'head.admin@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'FIN001', 'Linda', 'Martinez', 'Rose', '1978-07-20'::date, 'FEMALE', '+1-555-0202', '789 Pine Avenue', 'Springfield', 'California', '90210', 'United States', 'Finance Manager', 'ACCOUNTANT', '2022-09-01'::date, 68000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'finance.manager@greenwood.com' LIMIT 1),
    NULL),

-- Teaching Staff (marked as TEACHER type)
(gen_random_uuid(), 'TCH001', 'James', 'Thompson', 'Robert', '1980-01-10'::date, 'MALE', '+1-555-0301', '123 Maple Drive', 'Springfield', 'California', '90210', 'United States', 'Senior Mathematics Teacher', 'TEACHER', '2021-08-15'::date, 72000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'math.teacher@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'TCH002', 'Maria', 'Rodriguez', 'Elena', '1982-05-18'::date, 'FEMALE', '+1-555-0302', '567 Elm Street', 'Springfield', 'California', '90210', 'United States', 'Science Department Head', 'TEACHER', '2021-08-15'::date, 74000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'science.teacher@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'TCH003', 'Sarah', 'Williams', NULL, '1985-11-03'::date, 'FEMALE', '+1-555-0303', '890 Cedar Lane', 'Springfield', 'California', '90210', 'United States', 'English Literature Teacher', 'TEACHER', '2022-01-10'::date, 65000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'english.teacher@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'TCH004', 'Michael', 'Davis', 'John', '1979-09-25'::date, 'MALE', '+1-555-0304', '234 Birch Road', 'Springfield', 'California', '90210', 'United States', 'History Teacher', 'TEACHER', '2021-08-20'::date, 67000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'history.teacher@greenwood.com' LIMIT 1),
    NULL),

-- Support Staff
(gen_random_uuid(), 'LIB001', 'Emily', 'Chen', NULL, '1983-04-12'::date, 'FEMALE', '+1-555-0401', '678 Willow Street', 'Springfield', 'California', '90210', 'United States', 'Head Librarian', 'LIBRARIAN', '2022-06-01'::date, 55000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'librarian@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'NUR001', 'Jennifer', 'Anderson', 'Marie', '1976-08-30'::date, 'FEMALE', '+1-555-0501', '345 Spruce Avenue', 'Springfield', 'California', '90210', 'United States', 'School Nurse', 'NURSE', '2022-08-15'::date, 62000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'nurse@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'COU001', 'David', 'Kim', 'Min', '1981-12-08'::date, 'MALE', '+1-555-0601', '901 Poplar Drive', 'Springfield', 'California', '90210', 'United States', 'Student Counselor', 'COUNSELOR', '2022-08-01'::date, 58000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'counselor@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'MNT001', 'Carlos', 'Ramirez', NULL, '1977-02-14'::date, 'MALE', '+1-555-0701', '456 Hickory Lane', 'Springfield', 'California', '90210', 'United States', 'Maintenance Supervisor', 'MAINTENANCE', '2022-07-01'::date, 48000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'maintenance@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'SEC001', 'Thomas', 'Brown', 'William', '1974-06-22'::date, 'MALE', '+1-555-0801', '123 Ash Street', 'Springfield', 'California', '90210', 'United States', 'Security Officer', 'SECURITY', '2022-08-01'::date, 45000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'security@greenwood.com' LIMIT 1),
    NULL),

(gen_random_uuid(), 'REC001', 'Jessica', 'Lee', 'Anne', '1988-10-05'::date, 'FEMALE', '+1-555-0901', '789 Walnut Avenue', 'Springfield', 'California', '90210', 'United States', 'Front Desk Receptionist', 'RECEPTIONIST', '2023-01-15'::date, 42000.00, 'ACTIVE', 
    (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1),
    (SELECT id FROM users WHERE email = 'reception@greenwood.com' LIMIT 1),
    NULL)

ON CONFLICT ("schoolId", "employeeId") DO NOTHING; -- Avoid duplicates

-- Summary of staff added:
-- 2 Administrative staff (1 Administrator, 1 Accountant)
-- 4 Teaching staff (4 Teachers)
-- 6 Support staff (1 Librarian, 1 Nurse, 1 Counselor, 1 Maintenance, 1 Security, 1 Receptionist)
-- Total: 12 staff members

-- Display summary
SELECT 'Staff insertion completed' as status;
SELECT 
    "staffType" as staff_type, 
    COUNT(*) as count 
FROM staff 
WHERE "schoolId" = (SELECT id FROM schools WHERE slug = 'greenwood-international' LIMIT 1)
GROUP BY "staffType"
ORDER BY "staffType";