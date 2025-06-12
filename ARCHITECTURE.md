# Online Ticket Booking System Data Models and API Documentation

## Authentication Flow

### User Registration
1. User submits registration form with personal details
2. Backend validates input and creates new user record
3. Login credentials stored (should use password hashing in production)

### Login Process
1. User provides email and password
2. Backend authenticates and returns JWT token
3. Frontend stores token in localStorage for authenticated requests

### Password Change Flow
1. User navigates to password change page from profile
2. User enters current password and new password (with confirmation)
3. Frontend validates password match and minimum requirements 
4. Request sent to backend with current and new password
5. Backend verifies:
   - User exists
   - Current password is correct
   - New password meets requirements
6. Password updated in database
7. Success message displayed to user
8. User logged out for security purposes

## Data Models

### User
```java
public class User {
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String nic;
    private String password;
}
```

### API Request/Response DTOs

#### ChangePasswordDTO
```java
public class ChangePasswordDTO {
    private String currentPassword;
    private String newPassword;
}
```

#### ResponseDTO (Generic Response)
```java
public class ResponseDTO {
    private Object data;
    private String message;
    private String status;
}
```

## Security Recommendations for Future Enhancements

1. **Password Hashing**: Implement BCrypt or similar password hashing algorithm
2. **Enhanced Password Validation**: 
   - Require upper and lowercase letters
   - Require numbers and special characters
   - Check against common password lists
3. **Rate Limiting**: Prevent brute force attacks
4. **Two-Factor Authentication**: Add additional security layer
