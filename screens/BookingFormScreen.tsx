import React, { useState, useEffect } from 'react';
import { NavigationTab, BookingFormData } from '../types';
import TrainDataService from '../services/trainDataService';
import { ArrowLeftIcon } from '../components/icons/FeatureIcons';

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
  const [showTipsCard, setShowTipsCard] = useState(true);

  useEffect(() => {
    // Load all stations
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
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    if (formData.departureStation === formData.arrivalStation) {
      alert('Stasiun asal dan tujuan tidak boleh sama');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-start">
          <button 
            onClick={() => setActiveTab(NavigationTab.TrainServices)}
            className="p-2 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Pemesanan Tiket</h1>
          <div></div>
        </div>
        <p className="text-sm opacity-90 mt-2 ml-10">Layanan: {selectedServiceType}</p>
      </div>

      <div className="p-4 space-y-6">

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <form className="space-y-4">
          {/* Stasiun Asal */}
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

          {/* Stasiun Tujuan */}
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

          {/* Tanggal Keberangkatan */}
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

          {/* Jumlah Penumpang */}
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

          {/* Tombol Cari Tiket */}
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

      {/* Info Card */}
      {showTipsCard && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 relative">
          {/* Close Button */}
          <button
            onClick={() => setShowTipsCard(false)}
            className="absolute top-2 right-2 p-1 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full transition-all duration-200 group"
            title="Tutup tips pemesanan"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-start gap-3 pr-8">
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
    </div>
  );
};

export default BookingFormScreen;
