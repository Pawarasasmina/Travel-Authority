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
    id?: number;
    title: string;
    description: string;
    location: string;
    images: string[]; // CHANGED: support multiple images
    keyPoints: string[]; // key points of the activity (add one by one)
    highlights?: string[];
    categories?: string[];
    additionalInfo?: string;
    packages: ActivityPackage[]; // list of packages
    active?: boolean;
}

// ActivityPackage type
export interface ActivityPackage {
    name: string;
    keyIncludes: string[]; // can add one by one
    priceForeignAdult: number;
    priceForeignKid: number;
    priceLocalAdult: number;
    priceLocalKid: number;
    openingTime: string; // available time (opening time)
    averageTime: string; // average time consume
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
