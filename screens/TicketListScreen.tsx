import React, { useState, useEffect } from 'react';
import { NavigationTab, AvailableTicket, BookingFormData } from '../types';
import TrainDataService from '../services/trainDataService';

interface TicketListScreenProps {
  setActiveTab: (tab: NavigationTab) => void;
  bookingFormData: BookingFormData;
  setSelectedTicket: (ticket: AvailableTicket) => void;
}

const TicketListScreen: React.FC<TicketListScreenProps> = ({ 
  setActiveTab, 
  bookingFormData,
  setSelectedTicket 
}) => {
  const [availableTickets, setAvailableTickets] = useState<AvailableTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'duration'>('time');

  useEffect(() => {
    const loadAvailableTickets = () => {
      setIsLoading(true);
      
      setTimeout(() => {
        const mockTickets: AvailableTicket[] = generateMockTickets();
        setAvailableTickets(mockTickets);
        setIsLoading(false);
      }, 300);
    };

    loadAvailableTickets();
  }, [bookingFormData]);

  const generateMockTickets = (): AvailableTicket[] => {
    const serviceType = bookingFormData?.serviceType?.toLowerCase() || 'intercity';
    
    let trains = TrainDataService.getAllTrainsByCategory(serviceType);
    
    if (!trains || trains.length === 0) {
      if (serviceType === 'kereta antar kota') {
        trains = TrainDataService.getAllTrainsByCategory('intercity');
      } else if (serviceType === 'kereta lokal') {
        trains = TrainDataService.getAllTrainsByCategory('local');
      }
    }
    
    if (!trains || trains.length === 0) {
      trains = [
        {
          id: 'fallback-1',
          name: 'Argo Bromo Anggrek',
          code: 'AB',
          route: {
            from: { code: 'GMR', name: 'Gambir', city: 'Jakarta' },
            to: { code: 'PSE', name: 'Pasar Turi', city: 'Surabaya' }
          },
          duration: '8 jam',
          distance: '720 km',
          classes: [
            { name: 'Ekonomi', price: 150000, facilities: ['AC', 'Toilet'] },
            { name: 'Bisnis', price: 300000, facilities: ['AC', 'Toilet', 'Snack'] },
            { name: 'Eksekutif', price: 600000, facilities: ['AC', 'Toilet', 'Snack', 'Meal'] }
          ],
          schedule: []
        },
        {
          id: 'fallback-2', 
          name: 'Taksaka',
          code: 'TA',
          route: {
            from: { code: 'GMR', name: 'Gambir', city: 'Jakarta' },
            to: { code: 'YK', name: 'Tugu', city: 'Yogyakarta' }
          },
          duration: '7 jam',
          distance: '550 km',
          classes: [
            { name: 'Ekonomi', price: 100000, facilities: ['AC', 'Toilet'] },
            { name: 'Bisnis', price: 250000, facilities: ['AC', 'Toilet', 'Snack'] },
            { name: 'Eksekutif', price: 550000, facilities: ['AC', 'Toilet', 'Snack', 'Meal'] }
          ],
          schedule: []
        }
      ];
    }

    const tickets: AvailableTicket[] = [];

    const ticketCount = Math.floor(Math.random() * 4) + 5;
    
    for (let i = 0; i < ticketCount; i++) {
      const train = trains[Math.floor(Math.random() * trains.length)];
      
      const availableClasses = train.classes || [
        { name: 'Ekonomi', price: 100000, facilities: ['AC', 'Toilet'] },
        { name: 'Bisnis', price: 200000, facilities: ['AC', 'Toilet', 'Snack'] },
        { name: 'Eksekutif', price: 300000, facilities: ['AC', 'Toilet', 'Snack', 'Meal'] }
      ];
      
      const trainClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
      
      const departureHour = Math.floor(Math.random() * 16) + 6;
      const departureMinute = Math.floor(Math.random() * 4) * 15; 
      const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
      
      const duration = Math.floor(Math.random() * 8) + 2;
      const arrivalHour = (departureHour + duration) % 24;
      const arrivalTime = `${arrivalHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;

      const departureStation = bookingFormData?.departureStation || 'Stasiun Jakarta (GMR)';
      const arrivalStation = bookingFormData?.arrivalStation || 'Stasiun Surabaya (PSE)';
      const departureDate = bookingFormData?.departureDate || new Date().toISOString().split('T')[0];

      const ticket: AvailableTicket = {
        id: `ticket-${i + 1}`,
        trainName: train.name || 'Kereta Express',
        trainClass: trainClass.name,
        departureStation: departureStation,
        departureTime: `${departureDate} ${departureTime}`,
        arrivalStation: arrivalStation,
        arrivalTime: `${departureDate} ${arrivalTime}`,
        price: trainClass.price || 100000,
        availableSeats: Math.floor(Math.random() * 50) + 10,
        duration: `${duration} jam ${Math.floor(Math.random() * 60)} menit`
      };

      tickets.push(ticket);
    }

    return tickets;
  };

  const sortTickets = (tickets: AvailableTicket[]) => {
    return [...tickets].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'time':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'duration':
          const aDuration = parseInt(a.duration.split(' ')[0]);
          const bDuration = parseInt(b.duration.split(' ')[0]);
          return aDuration - bDuration;
        default:
          return 0;
      }
    });
  };

  const handleBookTicket = (ticket: AvailableTicket) => {
    setSelectedTicket(ticket);
    setActiveTab(NavigationTab.PassengerForm);
  };

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClassColor = (trainClass: string) => {
    switch (trainClass.toLowerCase()) {
      case 'ekonomi':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'bisnis':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'eksekutif':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'luxury':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <button
            onClick={() => setActiveTab(NavigationTab.BookingForm)}
            className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Form Pemesanan
          </button>
          
          <div className="flex justify-center items-center gap-2 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mencari Tiket Tersedia...</h2>
          </div>
        </div>
        
        {}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <button
          onClick={() => setActiveTab(NavigationTab.BookingForm)}
          className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Form Pemesanan
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Tiket Tersedia</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><span className="font-medium">Rute:</span> {bookingFormData.departureStation} → {bookingFormData.arrivalStation}</p>
          <p><span className="font-medium">Tanggal:</span> {new Date(bookingFormData.departureDate).toLocaleDateString('id-ID')}</p>
          <p><span className="font-medium">Penumpang:</span> {bookingFormData.passengerCount} orang</p>
        </div>
      </div>

        {}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Urutkan berdasarkan:</h3>
          <div className="flex gap-2">
            {[
              { key: 'time', label: 'Waktu' },
              { key: 'price', label: 'Harga' },
              { key: 'duration', label: 'Durasi' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

        {}
      <div className="space-y-4">
        {sortTickets(availableTickets).map((ticket, index) => (
          <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                  </svg>
                  <h3 className="font-bold text-gray-900 dark:text-white">{ticket.trainName}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getClassColor(ticket.trainClass)}`}>
                    {ticket.trainClass}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Keberangkatan</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatTime(ticket.departureTime)}</p>
                    <p className="text-gray-500 dark:text-gray-500">{ticket.departureStation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Kedatangan</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatTime(ticket.arrivalTime)}</p>
                    <p className="text-gray-500 dark:text-gray-500">{ticket.arrivalStation}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>⏱️ {ticket.duration}</span>
                  <span>💺 {ticket.availableSeats} kursi tersedia</span>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  Rp {ticket.price.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  per orang
                </p>
                <button
                  onClick={() => handleBookTicket(ticket)}
                  className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Pilih Tiket
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {availableTickets.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Tidak Ada Tiket Tersedia</h3>
          <p className="text-gray-500 dark:text-gray-500">Coba pilih tanggal atau rute yang berbeda</p>
        </div>
      )}
    </div>
  );
};

export default TicketListScreen;


