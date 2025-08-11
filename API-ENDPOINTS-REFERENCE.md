# Travel Authority API Endpoints Reference

This document provides a quick reference for all available API endpoints in the Travel Authority system.

## Authentication API

| Method | Endpoint                | Description                        | Authentication Required |
|--------|-------------------------|------------------------------------|-------------------------|
| POST   | `/api/v1/auth/register` | Register a new user                | No                      |
| POST   | `/api/v1/auth/login`    | Authenticate and get access token  | No                      |

## User API

| Method | Endpoint                          | Description                   | Authentication Required |
|--------|-----------------------------------|-------------------------------|-------------------------|
| GET    | `/api/v1/user/{id}`               | Get user by ID                | Yes                     |
| GET    | `/api/v1/user/all`                | Get all users                 | Yes (Admin)             |
| POST   | `/api/v1/user/save`               | Create a new user             | Yes (Admin)             |
| PUT    | `/api/v1/user/update/{id}`        | Update user information       | Yes                     |
| DELETE | `/api/v1/user/delete/{id}`        | Delete a user                 | Yes (Admin)             |
| POST   | `/api/v1/user/change-password/{id}` | Change user password        | Yes                     |

## Activity API

| Method | Endpoint                            | Description                  | Authentication Required |
|--------|-------------------------------------|------------------------------|-------------------------|
| GET    | `/api/v1/activity/all`              | Get all activities           | No                      |
| GET    | `/api/v1/activity/active`           | Get active activities        | No                      |
| GET    | `/api/v1/activity/{id}`             | Get activity by ID           | No                      |
| POST   | `/api/v1/activity/save`             | Create a new activity        | Yes (Owner/Admin)       |
| PUT    | `/api/v1/activity/update/{id}`      | Update activity information  | Yes (Owner/Admin)       |
| DELETE | `/api/v1/activity/delete/{id}`      | Delete an activity           | Yes (Owner/Admin)       |
| DELETE | `/api/v1/activity/delete/all`       | Delete all activities        | Yes (Admin)             |
| GET    | `/api/v1/activity/owner/{email}`    | Get activities by owner      | Yes (Owner)             |
| GET    | `/api/v1/activity/check-availability` | Check activity availability | No                     |

## Booking API

| Method | Endpoint                              | Description                   | Authentication Required |
|--------|---------------------------------------|-------------------------------|-------------------------|
| POST   | `/api/v1/bookings`                    | Create a new booking          | Yes                     |
| GET    | `/api/v1/bookings`                    | Get user bookings             | Yes                     |
| GET    | `/api/v1/bookings/{bookingId}`        | Get booking by ID             | Yes                     |
| PUT    | `/api/v1/bookings/{bookingId}/status` | Update booking status         | Yes                     |

## Offer API

| Method | Endpoint                           | Description                    | Authentication Required |
|--------|-----------------------------------|--------------------------------|-------------------------|
| POST   | `/api/v1/offers/save`             | Create a new offer             | Yes (Admin/Owner)       |
| GET    | `/api/v1/offers/all`              | Get all offers                 | No                      |
| GET    | `/api/v1/offers/active`           | Get active offers              | No                      |
| GET    | `/api/v1/offers/{id}`             | Get offer by ID                | No                      |
| PUT    | `/api/v1/offers/update/{id}`      | Update an offer                | Yes (Admin/Owner)       |
| DELETE | `/api/v1/offers/delete/{id}`      | Delete an offer                | Yes (Admin/Owner)       |
| DELETE | `/api/v1/offers/delete/all`       | Delete all offers              | Yes (Admin)             |
| GET    | `/api/v1/offers/owner/{email}`    | Get offers by owner            | Yes (Owner)             |
| GET    | `/api/v1/offers/check-package`    | Check package offer availability | No                    |

## Admin API

| Method | Endpoint                                   | Description                      | Authentication Required |
|--------|-------------------------------------------|----------------------------------|-------------------------|
| GET    | `/api/v1/admin/dashboard`                 | Get admin dashboard data         | Yes (Admin)             |
| GET    | `/api/v1/admin/owner/dashboard`           | Get owner dashboard data         | Yes (Owner)             |
| GET    | `/api/v1/admin/users`                     | Get all users                    | Yes (Admin)             |
| PUT    | `/api/v1/admin/users/{userId}/role`       | Update user role                 | Yes (Admin)             |
| GET    | `/api/v1/admin/bookings`                  | Get all bookings                 | Yes (Admin)             |
| PUT    | `/api/v1/admin/bookings/{bookingId}/status` | Update booking status          | Yes (Admin)             |
| GET    | `/api/v1/admin/owner/bookings`            | Get owner bookings               | Yes (Owner)             |
| PUT    | `/api/v1/admin/owner/bookings/{bookingId}/status` | Update owner booking status | Yes (Owner)          |
| POST   | `/api/v1/admin/owner/bookings/{bookingId}/complete` | Mark booking as complete | Yes (Owner)           |
| POST   | `/api/v1/admin/owner/bookings/verify-qr`  | Verify booking QR code           | Yes (Owner)             |
| GET    | `/api/v1/admin/check-admin`               | Check admin access               | Yes                     |
| GET    | `/api/v1/admin/check-owner`               | Check owner access               | Yes                     |

## Notification API

| Method | Endpoint                                  | Description                       | Authentication Required |
|--------|------------------------------------------|-----------------------------------|-------------------------|
| POST   | `/api/v1/admin/notifications`            | Create a notification             | Yes (Admin)             |
| GET    | `/api/v1/admin/notifications`            | Get all notifications             | Yes (Admin)             |
| PUT    | `/api/v1/admin/notifications/{notificationId}` | Update a notification        | Yes (Admin)             |
| DELETE | `/api/v1/admin/notifications/{notificationId}` | Delete a notification        | Yes (Admin)             |
| GET    | `/api/v1/admin/notifications/types`      | Get notification types            | Yes (Admin)             |
| GET    | `/api/v1/admin/notifications/target-types` | Get notification target types   | Yes (Admin)             |

## Review API

| Method | Endpoint                           | Description                     | Authentication Required |
|--------|------------------------------------|--------------------------------|-------------------------|
| POST   | `/api/v1/reviews`                  | Submit a review                | Yes                     |
| GET    | `/api/v1/reviews/activity/{id}`    | Get reviews by activity ID     | No                      |
| GET    | `/api/v1/reviews/user`             | Get reviews by current user    | Yes                     |
| DELETE | `/api/v1/reviews/{id}`             | Delete a review                | Yes                     |

## Authentication

Most endpoints require authentication via:
- Bearer token in the `Authorization` header: `Authorization: Bearer {token}`
- User email in the `X-User-Email` header for certain endpoints

## Common Response Format

```json
{
  "status": "OK|ERROR",
  "message": "Description message",
  "data": { 
    // The actual response data (if successful)
  }
}
```

## Error Handling

Standard HTTP status codes are used along with descriptive error messages in the response body.

## For More Details

For complete API documentation with request/response schemas:
- Access the Swagger UI at: http://localhost:8080/swagger-ui.html
- Access the OpenAPI JSON at: http://localhost:8080/api-docs
