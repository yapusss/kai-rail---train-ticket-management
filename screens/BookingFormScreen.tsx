import React, { useState, useEffect } from 'react';
import { NavigationTab, BookingFormData } from '../types';
import TrainDataService from '../services/trainDataService';
import Swal from 'sweetalert2';

interface BookingFormScreenProps {
  setActiveTab: (tab: NavigationTab) => void;
  selectedServiceType: string;
  setBookingFormData: (data: BookingFormData) => void;
}

const BookingFormScreen: React.FC<BookingFormScreenProps> = ({ 
  setActiveTab, 
  selectedServiceType,
  setBookingFormData 
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: selectedServiceType,
    departureStation: '',
    arrivalStation: '',
    departureDate: '',
    passengerCount: 1
  });

  const [stations, setStations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingTips, setShowBookingTips] = useState(true);

  useEffect(() => {
    const allStations = TrainDataService.getAllStations();
    setStations(allStations);
  }, []);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchTickets = () => {
    if (!formData.departureStation || !formData.arrivalStation || !formData.departureDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Mohon lengkapi semua field yang diperlukan',
        confirmButtonText: 'Baik'
      });
      return;
    }

    if (formData.departureStation === formData.arrivalStation) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan!',
        text: 'Stasiun asal dan tujuan tidak boleh sama',
        confirmButtonText: 'Baik'
      });
      return;
    }

    setBookingFormData(formData);
    setActiveTab(NavigationTab.TicketList);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <button
          onClick={() => setActiveTab(NavigationTab.Dashboard)}
          className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Pilihan Layanan
        </button>
        
        <div className="flex justify-center items-center gap-2 mb-2">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pemesanan Tiket</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Layanan: <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedServiceType}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <form className="space-y-4">
        {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stasiun Asal
            </label>
            <select
              value={formData.departureStation}
              onChange={(e) => handleInputChange('departureStation', e.target.value)}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Pilih Stasiun Asal</option>
              {stations.map((station, index) => (
                <option key={index} value={`${station.name} (${station.code})`}>
                  {station.name} ({station.code}) - {station.city}
                </option>
              ))}
            </select>
          </div>

        {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stasiun Tujuan
            </label>
            <select
              value={formData.arrivalStation}
              onChange={(e) => handleInputChange('arrivalStation', e.target.value)}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Pilih Stasiun Tujuan</option>
              {stations.map((station, index) => (
                <option key={index} value={`${station.name} (${station.code})`}>
                  {station.name} ({station.code}) - {station.city}
                </option>
              ))}
            </select>
          </div>

        {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Keberangkatan
            </label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              min={getMinDate()}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

        {}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jumlah Penumpang
            </label>
            <select
              value={formData.passengerCount}
              onChange={(e) => handleInputChange('passengerCount', parseInt(e.target.value))}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} Penumpang</option>
              ))}
            </select>
          </div>

        {}
          <button
            type="button"
            onClick={handleSearchTickets}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mencari Tiket...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cari Tiket Tersedia
              </div>
            )}
          </button>
        </form>
      </div>

        {}
      {showBookingTips && (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 relative">
        {/* Close Button */}
        <button
          onClick={() => setShowBookingTips(false)}
          className="absolute top-2 right-2 p-1 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full transition-all duration-200 group"
          title="Tutup tips pemesanan"
        >
          <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Tips Pemesanan</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Pilih tanggal minimal 1 hari dari hari ini</li>
              <li>• Pastikan stasiun asal dan tujuan berbeda</li>
              <li>• Maksimal 8 penumpang per pemesanan</li>
              <li>• Tiket dapat dibatalkan maksimal 2 jam sebelum keberangkatan</li>
            </ul>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default BookingFormScreen;
