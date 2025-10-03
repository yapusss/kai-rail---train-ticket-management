
export enum NavigationTab {
  Dashboard = 'DASHBOARD',
  Planner = 'PLANNER',
  InterCityBooking = 'INTERCITY_BOOKING',
  CommuterLine = 'COMMUTER_LINE',
  BookingForm = 'BOOKING_FORM',
  Payment = 'PAYMENT',
  TicketList = 'TICKET_LIST',
  PassengerForm = 'PASSENGER_FORM',
  Tickets = 'TICKETS',
  TicketCode = 'TICKET_CODE',
  Promotion = 'PROMOTION',
  Account = 'ACCOUNT',
  Notifications = 'NOTIFICATIONS',
}

export enum TrainClass {
  Economy = 'Ekonomi',
  Business = 'Bisnis',
  Executive = 'Eksekutif',
  Luxury = 'Luxury',
}

export interface Ticket {
  id: string;
  bookingCode: string;
  trainName: string;
  trainClass: TrainClass;
  route: {
    from: string;
    to: string;
  };
  departure: {
    station: string;
    time: Date;
  };
  arrival: {
    station: string;
    time: Date;
  };
  passengers: { name: string; id: string }[];
  price: number;
  isActive: boolean;
}

export interface User {
  name: string;
  email: string;
  memberId: string;
  avatarUrl: string;
}

export interface TripStep {
  trainName: string;
  trainClass: string;
  departureStation: string;
  departureTime: string;
  arrivalStation: string;
  arrivalTime: string;
  estimatedPrice: number;
  notes?: string;
}

export interface TripPlan {
  planTitle: string;
  totalEstimatedPrice: number;
  steps: TripStep[];
}

export interface BookingFormData {
  serviceType: string;
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  passengerCount: number;
}

export interface AvailableTicket {
  id: string;
  trainName: string;
  trainClass: string;
  departureStation: string;
  departureTime: string;
  arrivalStation: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  duration: string;
}

export interface PassengerData {
  name: string;
  nik: string;
  phone: string;
}

export interface BookedTicket extends Ticket {
  passengerData: PassengerData;
  bookingDate: string;
  status: 'active' | 'completed' | 'cancelled';
}
