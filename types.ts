export enum NavigationTab {
  Dashboard = "DASHBOARD",
  Planner = "PLANNER",
  TrainServices = "TRAIN_SERVICES",
  Tickets = "TICKETS",
  Promotion = "PROMOTION",
  Account = "ACCOUNT",
  Payment = "PAYMENT",
}

export enum TrainClass {
  Economy = "Ekonomi",
  Business = "Bisnis",
  Executive = "Eksekutif",
  Luxury = "Luxury",
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

export interface PaymentIntent {
  fromStation: string;
  toStation?: string;
  lineId?: string;
  serviceName: string;
  date: string;
  passengers: number;
  amount: number;
}
