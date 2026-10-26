CREATE DATABASE IF NOT EXISTS institute_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE institute_booking;
CREATE TABLE IF NOT EXISTS spaces (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 space_type ENUM('classroom','computer_lab','meeting_room','workshop','other') NOT NULL DEFAULT 'classroom',
 building VARCHAR(100) NOT NULL DEFAULT 'Main Building', floor_label VARCHAR(30),
 capacity INT UNSIGNED NOT NULL, description VARCHAR(500), equipment JSON,
 is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CHECK (capacity > 0), INDEX idx_spaces_type_active(space_type,is_active)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(120) NOT NULL,
 email VARCHAR(254) NOT NULL UNIQUE, role ENUM('teacher','student','staff','admin') NOT NULL DEFAULT 'teacher',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS bookings (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, space_id BIGINT UNSIGNED NOT NULL,
 user_id BIGINT UNSIGNED NULL, booked_by VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL,
 purpose VARCHAR(250) NOT NULL, booking_date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL,
 status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_bookings_space FOREIGN KEY(space_id) REFERENCES spaces(id),
 CONSTRAINT fk_bookings_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
 CHECK(end_time > start_time), INDEX idx_bookings_space_date_status(space_id,booking_date,status), INDEX idx_bookings_date(booking_date)
) ENGINE=InnoDB;
INSERT INTO spaces(name,space_type,building,floor_label,capacity,description,equipment) VALUES
('Classroom A101','classroom','Main Building','1st floor',30,'Standard teaching classroom',JSON_ARRAY('Projector','Whiteboard')),
('Computer Lab B204','computer_lab','Technology Building','2nd floor',24,'Computer lab for programming and networking',JSON_ARRAY('24 PCs','Projector','Network lab')),
('Meeting Room C012','meeting_room','Main Building','Ground floor',10,'Small meeting and project room',JSON_ARRAY('Display','Video conferencing')),
('Workshop D001','workshop','Technology Building','Ground floor',16,'Practical workshop space',JSON_ARRAY('Workbench','Storage'));
