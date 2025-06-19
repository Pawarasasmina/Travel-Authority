export interface Project {
  title: string;
  description: string;
  tech: string[];
  github: string;
  image: string;
  website?: string; // Optional website field for published projects
}

// User type
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
    birthdate?: string;
    gender?: string;
    role: string; // 'USER' or 'ADMIN'
}

// API response structure
export interface ApiResponse {
    data: any;
    status: string;
    message: string;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Registration data
export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
    password: string;
    confirmPassword: string;
}

// User profile update data
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    birthdate?: string;
    gender?: string;
}

// Activity data
export interface Activity {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    category: string;
    rating?: number;
    images: string[];
}

// Booking data
export interface Booking {
    id: string;
    title: string;
    location: string;
    image: string;
    date: string;
    status: string;
    price: number;
    serviceFee: number;
    tax: number;
    persons: number;
    bookingTime: string;
    paymentMethod: string;
    packageType: string;
    peopleCounts: Record<string, number>;
}
