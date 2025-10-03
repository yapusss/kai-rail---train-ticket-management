import React from 'react';

export interface PaymentMethod {
  id: string;
  type: 'bank_card' | 'e_wallet' | 'bank_transfer';
  name: string;
  details: string;
  expiryDate?: string;
  isPrimary: boolean;
  provider?: string;
}

export interface PaymentData {
  bookingData: {
    serviceType: string;
    departureStation: string;
    arrivalStation: string;
    fare: number;
    distance: number;
    travelTime: number;
    passengers?: number;
    date?: string;
  };
  selectedPaymentMethod: PaymentMethod | null;
}

export class PaymentService {
  private static boughtTicketsStorage = 'kai_bought_tickets';
  
  static getUserPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'visa-001',
        type: 'bank_card',
        name: 'Visa **** 1234',
        details: 'Kadaluarsa 12/25',
        expiryDate: '12/25',
        isPrimary: true,
        provider: 'Visa'
      },
      {
        id: 'gopay-001',
        type: 'e_wallet',
        name: 'GoPay',
        details: '08**********',
        isPrimary: true,
        provider: 'GoPay'
      },
      {
        id: 'bca-001',
        type: 'bank_transfer',
        name: 'BCA Virtual Account',
        details: '1234567890',
        isPrimary: false,
        provider: 'BCA'
      },
      {
        id: 'dana-001',
        type: 'e_wallet',
        name: 'DANA',
        details: '08**********',
        isPrimary: false,
        provider: 'DANA'
      }
    ];
  }

  static getPrimaryPaymentMethod(): PaymentMethod | null {
    const methods = this.getUserPaymentMethods();
    return methods.find(method => method.isPrimary) || null;
  }

  static async processPayment(
    paymentData: PaymentData
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
          resolve({
            success: true,
            transactionId,
            message: 'Pembayaran berhasil diproses'
          });
        } else {
          resolve({
            success: false,
            message: 'Pembayaran gagal diproses. Silakan coba lagi.'
          });
        }
      }, 3000); 
    });
  }

  static getPaymentMethodIcon(method: PaymentMethod): React.ReactNode {
    switch (method.type) {
      case 'bank_card':
        return {
          type: 'bank_card',
          className: 'w-5 h-5 text-blue-600',
          path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
        };
      case 'e_wallet':
        return {
          type: 'e_wallet',
          className: 'w-5 h-5 text-green-600',
          path: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
        };
      case 'bank_transfer':
        return {
          type: 'bank_transfer',
          className: 'w-5 h-5 text-purple-600',
          path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
        };
      default:
        return {
          type: 'default',
          className: 'w-5 h-5 text-gray-600',
          path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
        };
    }
  }

  static getPaymentMethodColor(method: PaymentMethod): string {
    switch (method.type) {
      case 'bank_card':
        return 'bg-blue-100';
      case 'e_wallet':
        return 'bg-green-100';
      case 'bank_transfer':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  }

  static createTicketFromPayment(
    paymentData: PaymentData,
    transactionId: string
  ): any {
    const bookingCode = `A${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const departureTime = new Date();
    departureTime.setHours(departureTime.getHours() + 1);
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + paymentData.bookingData.travelTime);

    const ticket = {
      id: `ticket-${Date.now()}`,
      bookingCode,
      transactionId,
      serviceType: paymentData.bookingData.serviceType,
      departure: {
        station: paymentData.bookingData.departureStation,
        time: departureTime
      },
      arrival: {
        station: paymentData.bookingData.arrivalStation,
        time: arrivalTime
      },
      passengers: paymentData.bookingData.passengers || 1,
      fare: paymentData.bookingData.fare,
      distance: paymentData.bookingData.distance,
      travelTime: paymentData.bookingData.travelTime,
      status: 'active',
      purchasedAt: new Date(),
      paymentMethod: paymentData.selectedPaymentMethod,
      isActive: true
    };

    this.saveTicket(ticket);

    return ticket;
  }

  static saveTicket(ticket: any): void {
    const existingTickets = this.getBoughtTickets();
    existingTickets.push(ticket);
    
    localStorage.setItem(this.boughtTicketsStorage, JSON.stringify(existingTickets));
  }

  static getBoughtTickets(): any[] {
    try {
      const tickets = localStorage.getItem(this.boughtTicketsStorage);
      return tickets ? JSON.parse(tickets) : [];
    } catch (error) {
      console.error('Error fetching bought tickets:', error);
      return [];
    }
  }

  static getActiveTickets(): any[] {
    const allTickets = this.getBoughtTickets();
    return allTickets.filter(ticket => ticket.isActive && ticket.status === 'active');
  }
}

export default PaymentService;
