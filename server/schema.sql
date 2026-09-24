-- Classroom Complaint Portal Database Schema
-- Database Name: classroom_complaint_portal

CREATE DATABASE IF NOT EXISTS `classroom_complaint_portal` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `classroom_complaint_portal`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `admin_id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `account_status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Staff Table (HOD & Faculty)
CREATE TABLE IF NOT EXISTS `staff` (
  `staff_id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('HOD', 'Faculty') NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `notifications_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `account_status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS `complaints` (
  `complaint_id` VARCHAR(20) NOT NULL PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `recipient_id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('Pending', 'Seen', 'In Progress', 'Replied', 'Resolved') NOT NULL DEFAULT 'Pending',
  `resolution_note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_complaints_student` (`student_id`),
  INDEX `idx_complaints_recipient` (`recipient_id`),
  INDEX `idx_complaints_status` (`status`),
  CONSTRAINT `fk_complaints_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_complaints_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Messages Table (Two-Way Messaging Thread)
CREATE TABLE IF NOT EXISTS `messages` (
  `message_id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(20) NOT NULL,
  `sender_id` VARCHAR(50) NOT NULL,
  `sender_role` ENUM('Student', 'Faculty', 'HOD', 'Admin') NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_messages_complaint` (`complaint_id`),
  CONSTRAINT `fk_messages_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `complaint_id` VARCHAR(20) DEFAULT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Complaint History Table (Audit Logging)
CREATE TABLE IF NOT EXISTS `complaint_history` (
  `history_id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(20) NOT NULL,
  `previous_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by_id` VARCHAR(50) NOT NULL,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_complaint` (`complaint_id`),
  CONSTRAINT `fk_history_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
