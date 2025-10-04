-- SQL Server Database Setup Script for KAI Rail
-- Run this script in SQL Server Management Studio or Azure Data Studio

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'kai_rail')
BEGIN
    CREATE DATABASE kai_rail;
END
GO

USE kai_rail;
GO

-- Create Tables
CREATE TABLE Trains (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    class NVARCHAR(50) NOT NULL,
    departure_station NVARCHAR(100) NOT NULL,
    arrival_station NVARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'active',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_code NVARCHAR(20) UNIQUE NOT NULL,
    train_id INT NOT NULL,
    passenger_name NVARCHAR(100) NOT NULL,
    passenger_nik NVARCHAR(20) NOT NULL,
    passenger_phone NVARCHAR(15) NOT NULL,
    booking_date DATETIME2 NOT NULL,
    travel_date DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'active',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (train_id) REFERENCES Trains(id)
);

CREATE TABLE Feedback (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_code NVARCHAR(20) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (booking_code) REFERENCES Bookings(booking_code)
);

CREATE TABLE Stations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(10) UNIQUE NOT NULL,
    city NVARCHAR(50) NOT NULL,
    region NVARCHAR(50) NOT NULL,
    status NVARCHAR(20) DEFAULT 'active'
);

-- Create Stored Procedures

-- Get all stations
CREATE OR ALTER PROCEDURE sp_GetAllStations
AS
BEGIN
    SELECT id, name, code, city, region, status
    FROM Stations
    WHERE status = 'active'
    ORDER BY city, name;
END
GO

-- Get intercity trains
CREATE OR ALTER PROCEDURE sp_GetInterCityTrains
AS
BEGIN
    SELECT id, name, class, departure_station, arrival_station, 
           departure_time, arrival_time, price, status
    FROM Trains
    WHERE class IN ('Executive', 'Business') AND status = 'active'
    ORDER BY departure_time;
END
GO

-- Get local trains
CREATE OR ALTER PROCEDURE sp_GetLokalTrains
AS
BEGIN
    SELECT id, name, class, departure_station, arrival_station, 
           departure_time, arrival_time, price, status
    FROM Trains
    WHERE class = 'Economy' AND status = 'active'
    ORDER BY departure_time;
END
GO

-- Get trains by route
CREATE OR ALTER PROCEDURE sp_GetTrainsByRoute
    @departure_station NVARCHAR(100),
    @arrival_station NVARCHAR(100),
    @travel_date DATE = NULL
AS
BEGIN
    SELECT id, name, class, departure_station, arrival_station, 
           departure_time, arrival_time, price, status
    FROM Trains
    WHERE departure_station LIKE '%' + @departure_station + '%'
      AND arrival_station LIKE '%' + @arrival_station + '%'
      AND status = 'active'
    ORDER BY departure_time;
END
GO

-- Search trains
CREATE OR ALTER PROCEDURE sp_SearchTrains
    @search_query NVARCHAR(100)
AS
BEGIN
    SELECT id, name, class, departure_station, arrival_station, 
           departure_time, arrival_time, price, status
    FROM Trains
    WHERE (name LIKE '%' + @search_query + '%'
       OR departure_station LIKE '%' + @search_query + '%'
       OR arrival_station LIKE '%' + @search_query + '%')
      AND status = 'active'
    ORDER BY departure_time;
END
GO

-- Get available tickets
CREATE OR ALTER PROCEDURE sp_GetAvailableTickets
    @train_id INT,
    @travel_date DATE,
    @class_type NVARCHAR(50)
AS
BEGIN
    -- Mock implementation - in real scenario, this would check actual seat availability
    SELECT 
        CAST(@train_id AS NVARCHAR(10)) + '-' + @class_type + '-1' AS id,
        @train_id AS train_id,
        @class_type AS class,
        CASE 
            WHEN @class_type = 'Economy' THEN 150000
            WHEN @class_type = 'Business' THEN 280000
            WHEN @class_type = 'Executive' THEN 450000
            ELSE 200000
        END AS price,
        CAST(FLOOR(RAND() * 50) + 10 AS INT) AS available_seats,
        '08:00' AS departure_time,
        '16:00' AS arrival_time;
END
GO

-- Create booking
CREATE OR ALTER PROCEDURE sp_CreateBooking
    @train_id INT,
    @passenger_name NVARCHAR(100),
    @passenger_nik NVARCHAR(20),
    @passenger_phone NVARCHAR(15),
    @ticket_class NVARCHAR(50),
    @travel_date DATE
AS
BEGIN
    DECLARE @booking_code NVARCHAR(20);
    DECLARE @booking_id INT;
    
    -- Generate booking code
    SET @booking_code = 'TIX-' + RIGHT('000000' + CAST(CAST(RAND() * 999999 AS INT) AS NVARCHAR(6)), 6);
    
    -- Insert booking
    INSERT INTO Bookings (booking_code, train_id, passenger_name, passenger_nik, 
                         passenger_phone, booking_date, travel_date)
    VALUES (@booking_code, @train_id, @passenger_name, @passenger_nik, 
            @passenger_phone, GETDATE(), @travel_date);
    
    SET @booking_id = SCOPE_IDENTITY();
    
    -- Return booking details
    SELECT 
        b.booking_code,
        t.name AS train_name,
        t.class AS train_class,
        t.departure_station,
        t.arrival_station,
        t.departure_time,
        t.arrival_time,
        t.price,
        b.passenger_name,
        b.passenger_nik,
        b.passenger_phone,
        b.booking_date,
        b.travel_date,
        b.status
    FROM Bookings b
    INNER JOIN Trains t ON b.train_id = t.id
    WHERE b.id = @booking_id;
END
GO

-- Get user bookings
CREATE OR ALTER PROCEDURE sp_GetUserBookings
    @user_nik NVARCHAR(20) = NULL
AS
BEGIN
    SELECT 
        b.booking_code,
        t.name AS train_name,
        t.class AS train_class,
        t.departure_station,
        t.arrival_station,
        t.departure_time,
        t.arrival_time,
        t.price,
        b.passenger_name,
        b.passenger_nik,
        b.passenger_phone,
        b.booking_date,
        b.travel_date,
        b.status
    FROM Bookings b
    INNER JOIN Trains t ON b.train_id = t.id
    WHERE (@user_nik IS NULL OR b.passenger_nik = @user_nik)
    ORDER BY b.booking_date DESC;
END
GO

-- Submit feedback
CREATE OR ALTER PROCEDURE sp_SubmitFeedback
    @booking_code NVARCHAR(20),
    @rating INT,
    @feedback_text NVARCHAR(MAX) = NULL
AS
BEGIN
    INSERT INTO Feedback (booking_code, rating, feedback_text)
    VALUES (@booking_code, @rating, @feedback_text);
    
    SELECT 'Feedback submitted successfully' AS message;
END
GO

-- Get ticket details
CREATE OR ALTER PROCEDURE sp_GetTicketDetails
    @booking_code NVARCHAR(20)
AS
BEGIN
    SELECT 
        b.booking_code,
        t.name AS train_name,
        t.class AS train_class,
        t.departure_station,
        t.arrival_station,
        t.departure_time,
        t.arrival_time,
        t.price,
        b.passenger_name,
        b.passenger_nik,
        b.passenger_phone,
        b.booking_date,
        b.travel_date,
        b.status
    FROM Bookings b
    INNER JOIN Trains t ON b.train_id = t.id
    WHERE b.booking_code = @booking_code;
END
GO

-- Update ticket status
CREATE OR ALTER PROCEDURE sp_UpdateTicketStatus
    @booking_code NVARCHAR(20),
    @new_status NVARCHAR(20)
AS
BEGIN
    UPDATE Bookings 
    SET status = @new_status, updated_at = GETDATE()
    WHERE booking_code = @booking_code;
    
    SELECT 'Ticket status updated successfully' AS message;
END
GO

-- Insert sample data
INSERT INTO Stations (name, code, city, region) VALUES
('Jakarta Kota', 'JAKK', 'Jakarta', 'DKI Jakarta'),
('Gambir', 'GMR', 'Jakarta', 'DKI Jakarta'),
('Surabaya Gubeng', 'SGU', 'Surabaya', 'Jawa Timur'),
('Surabaya Pasar Turi', 'SBI', 'Surabaya', 'Jawa Timur'),
('Yogyakarta', 'YK', 'Yogyakarta', 'DI Yogyakarta'),
('Bandung', 'BD', 'Bandung', 'Jawa Barat'),
('Semarang Tawang', 'SMT', 'Semarang', 'Jawa Tengah'),
('Purwokerto', 'PWT', 'Purwokerto', 'Jawa Tengah');

INSERT INTO Trains (name, class, departure_station, arrival_station, departure_time, arrival_time, price) VALUES
('Argo Bromo Anggrek', 'Executive', 'Gambir', 'Surabaya Gubeng', '08:00', '16:00', 450000),
('Kereta Api Jayabaya', 'Business', 'Jakarta Kota', 'Surabaya Pasar Turi', '10:00', '22:00', 320000),
('Kereta Api Taksaka', 'Executive', 'Gambir', 'Yogyakarta', '07:00', '14:00', 380000),
('Kereta Api Serayu', 'Economy', 'Jakarta Kota', 'Purwokerto', '09:00', '15:00', 150000),
('Kereta Api Argo Lawu', 'Executive', 'Gambir', 'Solo Balapan', '08:30', '15:30', 350000),
('Kereta Api Bima', 'Business', 'Jakarta Kota', 'Surabaya Pasar Turi', '14:00', '00:00', 280000);

PRINT 'Database setup completed successfully!';
PRINT 'Tables created: Trains, Bookings, Feedback, Stations';
PRINT 'Stored procedures created: sp_GetAllStations, sp_GetInterCityTrains, sp_GetLokalTrains, sp_GetTrainsByRoute, sp_SearchTrains, sp_GetAvailableTickets, sp_CreateBooking, sp_GetUserBookings, sp_SubmitFeedback, sp_GetTicketDetails, sp_UpdateTicketStatus';
PRINT 'Sample data inserted successfully!';
