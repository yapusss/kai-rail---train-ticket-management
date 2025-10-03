import React, { useState } from 'react';
import { NavigationTab, AvailableTicket } from '../types';
import { ArrowLeftIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import Swal from 'sweetalert2';

interface InterCityBookingScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
    setSelectedServiceType: (serviceType: string) => void;
    setBookingFormData: (data: any) => void;
    setSelectedTicket: (ticket: AvailableTicket) => void;
    showTrainListDirectly?: boolean;
}

const InterCityBookingScreen: React.FC<InterCityBookingScreenProps> = ({ 
    setActiveTab, 
    setSelectedServiceType, 
    setBookingFormData,
    setSelectedTicket,
    showTrainListDirectly = false
}) => {
    const interCityService = TrainDataService.getTrainServiceById('intercity');
    const [showTrainList, setShowTrainList] = useState<boolean>(false);
    const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
    const [bookingForm, setBookingForm] = useState({
        departureStation: '',
        arrivalStation: '',
        departureDate: '',
        passengerCount: 1
    });

    const handleBackToDashboard = () => {
        setActiveTab(NavigationTab.Dashboard);
    };

    const handleBookTrain = (trainName: string, route: string) => {
        setSelectedServiceType(trainName);
        setBookingFormData({
            serviceType: 'Antar Kota',
            trainName,
            route,
            ...bookingForm
        });
        setActiveTab(NavigationTab.BookingForm);
    };

    const handleBookTicket = (train: any) => {
        const today = new Date();
        const departureDate = new Date(today.getTime() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000);
        const arrivalDate = new Date(departureDate.getTime() + 8 * 60 * 60 * 1000);
        
        const departureTimeStr = train.schedule?.[0]?.departure || '08:00';
        const arrivalTimeStr = train.schedule?.[0]?.arrival || '16:00';
        
        const [depHour, depMin] = departureTimeStr.split(':').map(Number);
        const [arrHour, arrMin] = arrivalTimeStr.split(':').map(Number);
        
        departureDate.setHours(depHour || 8, depMin || 0, 0, 0);
        arrivalDate.setHours(arrHour || 16, arrMin || 0, 0, 0);
        
        const availableTicket: AvailableTicket = {
            id: `ticket-${train.id}-${Date.now()}`,
            trainName: train.name,
            trainClass: train.classes[0]?.name || 'Economy',
            departureStation: train.route?.from?.name || 'Unknown',
            departureTime: departureDate.toISOString(),
            arrivalStation: train.route?.to?.name || 'Unknown',
            arrivalTime: arrivalDate.toISOString(),
            price: train.classes?.[0]?.price || 100000,
            availableSeats: Math.floor(Math.random() * 50) + 10,
            duration: train.schedule?.[0]?.duration || '8 jam'
        };

        setSelectedTicket(availableTicket);
        setActiveTab(NavigationTab.PassengerForm);
    };

    const handleSearchTrains = () => {
        if (bookingForm.departureStation && bookingForm.arrivalStation && bookingForm.departureDate) {
            setShowTrainList(true);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian!',
                text: 'Mohon lengkapi semua field terlebih dahulu',
                confirmButtonText: 'Baik'
            });
        }
    };

    if (!interCityService) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-600 dark:text-gray-400">
                    <p>Service not found</p>
                </div>
            </div>
        );
    }

    if (!showTrainList && !showTrainListDirectly) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-start">
                        <button 
                            onClick={handleBackToDashboard}
                            className="p-2 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Pemesanan Tiket Antar Kota</h1>
                        <div></div>
                    </div>
                    <p className="text-sm opacity-90 mt-2 ml-10">{interCityService.description}</p>
                </div>

        {}
                <div className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Form Pemesanan</h2>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md space-y-4">
        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stasiun Asal
                            </label>
                            <select
                                value={bookingForm.departureStation}
                                onChange={(e) => setBookingForm({...bookingForm, departureStation: e.target.value})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Pilih Stasiun Asal</option>
                                <option value="Jakarta">Jakarta</option>
                                <option value="Bandung">Bandung</option>
                                <option value="Surabaya">Surabaya</option>
                                <option value="Yogyakarta">Yogyakarta</option>
                                <option value="Malang">Malang</option>
                            </select>
                        </div>

        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stasiun Tujuan
                            </label>
                            <select
                                value={bookingForm.arrivalStation}
                                onChange={(e) => setBookingForm({...bookingForm, arrivalStation: e.target.value})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Pilih Stasiun Tujuan</option>
                                <option value="Jakarta">Jakarta</option>
                                <option value="Bandung">Bandung</option>
                                <option value="Surabaya">Surabaya</option>
                                <option value="Yogyakarta">Yogyakarta</option>
                                <option value="Malang">Malang</option>
                            </select>
                        </div>

        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tanggal Keberangkatan
                            </label>
                            <input
                                type="date"
                                value={bookingForm.departureDate}
                                onChange={(e) => setBookingForm({...bookingForm, departureDate: e.target.value})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Jumlah Penumpang
                            </label>
                            <select
                                value={bookingForm.passengerCount}
                                onChange={(e) => setBookingForm({...bookingForm, passengerCount: parseInt(e.target.value)})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                    <option key={num} value={num}>{num} Penumpang</option>
                                ))}
                            </select>
                        </div>

        {}
                        <button
                            onClick={handleSearchTrains}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cari Kereta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-start">
                    <button 
                        onClick={() => setShowTrainList(false)}
                        className="p-2 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Pilih Kereta</h1>
                    <div></div>
                </div>
                <p className="text-sm opacity-90 mt-2 ml-10">
                    {showTrainListDirectly 
                        ? (bookingForm.departureStation && bookingForm.arrivalStation 
                            ? `${bookingForm.departureStation} → ${bookingForm.arrivalStation}`
                            : 'Pilih Kereta yang Tersedia')
                        : `${bookingForm.departureStation} → ${bookingForm.arrivalStation}`
                    }
                </p>
            </div>

        {}
            <div className="p-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Kereta Tersedia</h2>
                <div className="space-y-3">
                    {interCityService.trains?.map((train: any, index: number) => (
                        <div key={train.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{train.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {train.route?.from?.city && train.route?.to?.city 
                                            ? `${train.route.from.city} → ${train.route.to.city}`
                                            : train.route || 'N/A'
                                        }
                                    </p>
                                    {train.code && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400">{train.code}</p>
                                    )}
                                </div>
                                <div className={`p-3 ${interCityService.bgColor} rounded-full`}>
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{train.duration}</p>
                                    </div>
                                    {train.distance && (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Jarak</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{train.distance}</p>
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Harga Mulai</p>
                                        <p className="font-semibold text-green-600 dark:text-green-400">
                                            {train.classes?.[0]?.price 
                                                ? TrainDataService.formatPrice(train.classes[0].price)
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {train.classes && train.classes.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kelas tersedia:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {train.classes.map((trainClass: any, classIndex: number) => (
                                            <span key={classIndex} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                                {trainClass.name} - {TrainDataService.formatPrice(trainClass.price)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {train.schedule && train.schedule.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Jadwal:</p>
                                    {train.schedule.map((schedule: any, scheduleIndex: number) => (
                                        <div key={scheduleIndex} className="text-sm text-gray-700 dark:text-gray-300">
                                            <p>Berangkat: {schedule.departure} | Tiba: {schedule.arrival}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                onClick={() => handleBookTicket(train)}
                                className={`w-full py-3 ${interCityService.bgColor} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                            >
                                Pesan Tiket
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterCityBookingScreen;
