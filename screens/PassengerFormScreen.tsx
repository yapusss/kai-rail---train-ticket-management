import React, { useState } from 'react';
import { NavigationTab, AvailableTicket, PassengerData, BookedTicket } from '../types';
import Swal from 'sweetalert2';

interface PassengerFormScreenProps {
  setActiveTab: (tab: NavigationTab) => void;
  selectedTicket: AvailableTicket;
  setBookedTicket: (ticket: BookedTicket) => void;
  setShowInterCityTrainList: (show: boolean) => void;
}

const PassengerFormScreen: React.FC<PassengerFormScreenProps> = ({ 
  setActiveTab, 
  selectedTicket,
  setBookedTicket,
  setShowInterCityTrainList
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

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join('\n• ');
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        html: `Mohon perbaiki data berikut:<br><br>• ${errorMessages}`,
        confirmButtonText: 'Baik'
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleBookTicket = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const bookingCode = `KAI${Date.now().toString().slice(-6)}`;
      
      const bookedTicket: BookedTicket = {
        id: `booked-${Date.now()}`,
        bookingCode: bookingCode,
        trainName: selectedTicket.trainName,
        trainClass: selectedTicket.trainClass as any,
        route: {
          from: selectedTicket.departureStation,
          to: selectedTicket.arrivalStation
        },
        departure: {
          station: selectedTicket.departureStation,
          time: new Date(selectedTicket.departureTime)
        },
        arrival: {
          station: selectedTicket.arrivalStation,
          time: new Date(selectedTicket.arrivalTime)
        },
        passengers: [{ name: passengerData.name, id: passengerData.nik }],
        price: selectedTicket.price,
        isActive: true,
        passengerData: passengerData,
        bookingDate: new Date().toISOString(),
        status: 'active'
      };

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
    if (isNaN(date.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Valid',
        text: 'Format tanggal tidak valid.',
        confirmButtonText: 'Baik'
      });
      return 'Invalid Date';
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-start">
          <button
            onClick={() => {
              setShowInterCityTrainList(true);
              setActiveTab(NavigationTab.InterCityBooking);
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="ml-4">
            <h1 className="text-xl font-bold">Data Penumpang</h1>
            <p className="text-sm opacity-90">Lengkapi data diri untuk menyelesaikan pemesanan</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">

      {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTicket.trainName}</h3>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getClassColor(selectedTicket.trainClass)}`}>
                {selectedTicket.trainClass}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Keberangkatan</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{selectedTicket.departureStation}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatTime(selectedTicket.departureTime)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Kedatangan</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{selectedTicket.arrivalStation}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatTime(selectedTicket.arrivalTime)}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Harga</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp {selectedTicket.price.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

      {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Data Penumpang</h2>
          </div>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={passengerData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap sesuai KTP"
                className={`w-full p-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={passengerData.nik}
                onChange={(e) => handleInputChange('nik', e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                className={`w-full p-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.nik ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.nik && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nik}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={passengerData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Contoh: 081234567890 atau +6281234567890"
                className={`w-full p-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.phone ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleBookTicket}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg">Memproses Pemesanan...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-lg">Beli Tiket - Rp {selectedTicket.price.toLocaleString('id-ID')}</span>
                </div>
              )}
            </button>
          </form>
        </div>

      {}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3 text-lg">Informasi Penting</h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span>Pastikan data yang diisi sesuai dengan dokumen identitas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span>Tiket akan dikirim via SMS ke nomor telepon yang terdaftar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span>Simpan kode booking untuk keperluan check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span>Tiket dapat dibatalkan maksimal 2 jam sebelum keberangkatan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerFormScreen;

