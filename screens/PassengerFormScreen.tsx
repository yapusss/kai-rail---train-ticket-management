import React, { useState } from 'react';
import { NavigationTab, AvailableTicket, PassengerData, BookedTicket } from '../types';

interface PassengerFormScreenProps {
  setActiveTab: (tab: NavigationTab) => void;
  selectedTicket: AvailableTicket;
  setBookedTicket: (ticket: BookedTicket) => void;
}

const PassengerFormScreen: React.FC<PassengerFormScreenProps> = ({ 
  setActiveTab, 
  selectedTicket,
  setBookedTicket 
}) => {
  const [passengerData, setPassengerData] = useState<PassengerData>({
    name: '',
    nik: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PassengerData>>({});

  const handleInputChange = (field: keyof PassengerData, value: string) => {
    setPassengerData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PassengerData> = {};

    if (!passengerData.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi';
    } else if (passengerData.name.trim().length < 3) {
      newErrors.name = 'Nama harus minimal 3 karakter';
    }

    if (!passengerData.nik.trim()) {
      newErrors.nik = 'NIK harus diisi';
    } else if (!/^\d{16}$/.test(passengerData.nik.trim())) {
      newErrors.nik = 'NIK harus 16 digit angka';
    }

    if (!passengerData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(passengerData.phone.trim().replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookTicket = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate booking process
    setTimeout(() => {
      const bookingCode = `KAI${Date.now().toString().slice(-6)}`;
      
      const bookedTicket: BookedTicket = {
        id: `booked-${Date.now()}`,
        bookingCode: bookingCode,
        trainName: selectedTicket.trainName,
        trainClass: selectedTicket.trainClass,
        departureStation: selectedTicket.departureStation,
        departureTime: selectedTicket.departureTime,
        arrivalStation: selectedTicket.arrivalStation,
        arrivalTime: selectedTicket.arrivalTime,
        price: selectedTicket.price,
        passengerData: passengerData,
        bookingDate: new Date().toISOString(),
        status: 'active'
      };

      // Save to localStorage (simulate database)
      const existingTickets = JSON.parse(localStorage.getItem('bookedTickets') || '[]');
      existingTickets.push(bookedTicket);
      localStorage.setItem('bookedTickets', JSON.stringify(existingTickets));

      setBookedTicket(bookedTicket);
      setActiveTab(NavigationTab.Tickets);
      setIsLoading(false);
    }, 2000);
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

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <button
          onClick={() => setActiveTab(NavigationTab.TicketList)}
          className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Pilihan Tiket
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Data Penumpang</h2>
        <p className="text-gray-600 dark:text-gray-400">Lengkapi data diri Anda untuk menyelesaikan pemesanan</p>
      </div>

      {/* Selected Ticket Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Tiket yang Dipilih</h3>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
              <span className="font-semibold text-blue-800 dark:text-blue-300">{selectedTicket.trainName}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${getClassColor(selectedTicket.trainClass)}`}>
                {selectedTicket.trainClass}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {formatTime(selectedTicket.departureTime)} → {formatTime(selectedTicket.arrivalTime)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {selectedTicket.departureStation} → {selectedTicket.arrivalStation}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-800 dark:text-blue-300">
              Rp {selectedTicket.price.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <form className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={passengerData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Masukkan nama lengkap sesuai KTP"
              className={`w-full p-3 border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* NIK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={passengerData.nik}
              onChange={(e) => handleInputChange('nik', e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan 16 digit NIK"
              maxLength={16}
              className={`w-full p-3 border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.nik ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.nik && (
              <p className="text-red-500 text-sm mt-1">{errors.nik}</p>
            )}
          </div>

          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={passengerData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Contoh: 081234567890 atau +6281234567890"
              className={`w-full p-3 border-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Tombol Beli Tiket */}
          <button
            type="button"
            onClick={handleBookTicket}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses Pemesanan...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Beli Tiket - Rp {selectedTicket.price.toLocaleString('id-ID')}
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Informasi Penting</h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Pastikan data yang diisi sesuai dengan dokumen identitas</li>
              <li>• Tiket akan dikirim via SMS ke nomor telepon yang terdaftar</li>
              <li>• Simpan kode booking untuk keperluan check-in</li>
              <li>• Tiket dapat dibatalkan maksimal 2 jam sebelum keberangkatan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerFormScreen;
