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

// Package data
export interface Package {
    id?: number;
    name: string;
    description: string;
    price: number; // Base price for backward compatibility
    availability?: number; // Number of spots available for this specific package
    foreignAdultPrice: number;
    foreignKidPrice: number;
    localAdultPrice: number;
    localKidPrice: number;
    features: string[];
    images: string[];
}

// Activity data
export interface Activity {
    id?: number;
    title: string;
    description: string;
    location: string;
    image: string;
    price: number;
    availability: number;
    rating: number;
    duration?: string;
    highlights?: string[];
    categories?: string[];
    additionalInfo?: string;
    packages?: Package[];
    active?: boolean;
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
    packageId?: number;
    packageName?: string;
    peopleCounts: Record<string, number>;
}
