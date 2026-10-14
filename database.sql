CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;
CREATE TABLE IF NOT EXISTS employees (
  employee_id VARCHAR(20) PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL
);
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  leave_type ENUM('Casual','Professional','Other') NOT NULL,
  no_of_days INT NOT NULL,
  description TEXT NOT NULL,
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO employees VALUES
('EMP001','Sowmya'),('EMP002','Rohith'),('EMP003','Anjali'),
('EMP004','Vikram'),('EMP005','Priya'),('EMP006','Sneha'),
('EMP007','Karthik'),('EMP008','Divya'),('EMP009','Aravind'),('EMP010','Meghana');
