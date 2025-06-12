# Online Ticket Booking System

## Overview
An online ticket booking application built with Spring Boot backend and React/TypeScript frontend.

## Features

### Authentication
- User registration and login
- Password management (reset and change)
- JWT-based authentication

### User Profile Management
- View and update user profile information
- Password change functionality with security validation

### Ticket Booking
- Browse available activities
- Select number of tickets
- Process payments
- View booking history

## Security Features

### Password Management
- Password strength validation (minimum 6 characters)
- Current password verification before changing
- Password security recommendations:
  - Consider implementing password hashing in production
  - Add more comprehensive password strength requirements
  - Implement account lockout after multiple failed attempts

## Development

### Backend (Spring Boot)
- API endpoints for user management and authentication
- MySQL database integration
- DTO pattern for data transfer
- Service-based architecture

### Frontend (React/TypeScript)
- Component-based UI architecture
- Context API for global state management
- Form validation with React Hook Form
- Responsive design with Tailwind CSS
