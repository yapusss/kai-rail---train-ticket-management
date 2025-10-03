import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ArrowLeftIcon, TrainIcon, CalendarIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import TrainScheduleScreen from './TrainScheduleScreen';
import Swal from 'sweetalert2';

interface TrainRouteSelectionScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

interface ScheduleOption {
    id: string;
    label: string;
    timeRange: string;
    selected: boolean;
}

interface RouteOption {
    id: string;
    lineName: string;
    lineColor: string;
    from: string;
    to: string;
    trainNumber: string;
    estimatedTime: string;
    frequency: string;
    departureTime?: string;
}

const TrainRouteSelectionScreen: React.FC<TrainRouteSelectionScreenProps> = ({ setActiveTab }) => {
    const [selectedStation, setSelectedStation] = useState('PESING');
    const [showStationModal, setShowStationModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [isScheduleApplied, setIsScheduleApplied] = useState(false);
    
    const availableStations = TrainDataService.getAllStations();
    
    const getRoutesFromStation = (stationName: string): RouteOption[] => {
        const stationRoutes = availableRoutes.filter(route => route.from === stationName);
        
        const currentTime = new Date();
        const baseHour = currentTime.getHours();
        const baseMinute = currentTime.getMinutes();
        
        return stationRoutes.map((route, index) => {
            let departureTime = '';
            if (selectedSchedule.id === '1hour') {
                const minutes = (baseMinute + (index * 10)) % 60;
                const hours = baseHour + Math.floor((baseMinute + (index * 10)) / 60);
                departureTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            } else if (selectedSchedule.id === 'today') {
                const hour = 6 + (index * 2) % 18;
                const minute = (index * 7) % 60;
                departureTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            } else {
                const [fromHour, fromMinute] = customFromTime.split(':').map(Number);
                const minutes = (fromMinute + (index * 15)) % 60;
                const hours = fromHour + Math.floor((fromMinute + (index * 15)) / 60);
                departureTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            
            return {
                ...route,
                departureTime
            };
        });
    };
    
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleOption>({
        id: '1hour',
        label: '1 Jam Kedepan',
        timeRange: '17:24 - 18:24',
        selected: true
    });
    const [customFromTime, setCustomFromTime] = useState('12:00');
    const [customToTime, setCustomToTime] = useState('13:00');
    const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
    const [showScheduleDetail, setShowScheduleDetail] = useState(false);

    const scheduleOptions: ScheduleOption[] = [
        {
            id: '1hour',
            label: '1 Jam Kedepan',
            timeRange: '17:24 - 18:24',
            selected: selectedSchedule.id === '1hour'
        },
        {
            id: 'today',
            label: '1 Hari ini',
            timeRange: '00:00 - 23:59',
            selected: selectedSchedule.id === 'today'
        },
        {
            id: 'custom',
            label: 'Atur Jadwal Sendiri',
            timeRange: `${customFromTime} - ${customToTime}`,
            selected: selectedSchedule.id === 'custom'
        }
    ];

    const availableRoutes: RouteOption[] = [
        {
            id: 'tanggerang-duri-1',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'PESING',
            to: 'DURI',
            trainNumber: '#1903A',
            estimatedTime: '15 menit',
            frequency: 'Setiap 10 menit'
        },
        {
            id: 'tanggerang-duri-2',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'PESING',
            to: 'DURI',
            trainNumber: '#1903B',
            estimatedTime: '15 menit',
            frequency: 'Setiap 10 menit'
        },
        {
            id: 'tanggerang-tangerang-1',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'PESING',
            to: 'TANGERANG',
            trainNumber: '#1904A',
            estimatedTime: '25 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'tanggerang-tangerang-2',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'PESING',
            to: 'TANGERANG',
            trainNumber: '#1904B',
            estimatedTime: '25 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'bst-airport-1',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'PESING',
            to: 'BANDARASOEKARNOHATTA',
            trainNumber: '#1905A',
            estimatedTime: '45 menit',
            frequency: 'Setiap 20 menit'
        },
        {
            id: 'bst-airport-2',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'PESING',
            to: 'BANDARASOEKARNOHATTA',
            trainNumber: '#1905B',
            estimatedTime: '45 menit',
            frequency: 'Setiap 20 menit'
        },
        {
            id: 'bst-manggarai-1',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'PESING',
            to: 'MANGGARAI',
            trainNumber: '#1906A',
            estimatedTime: '30 menit',
            frequency: 'Setiap 12 menit'
        },
        {
            id: 'bst-manggarai-2',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'PESING',
            to: 'MANGGARAI',
            trainNumber: '#1906B',
            estimatedTime: '30 menit',
            frequency: 'Setiap 12 menit'
        },
        {
            id: 'duri-tangerang-1',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'DURI',
            to: 'TANGERANG',
            trainNumber: '#1907A',
            estimatedTime: '20 menit',
            frequency: 'Setiap 12 menit'
        },
        {
            id: 'duri-tangerang-2',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'DURI',
            to: 'TANGERANG',
            trainNumber: '#1907B',
            estimatedTime: '20 menit',
            frequency: 'Setiap 12 menit'
        },
        {
            id: 'duri-manggarai-1',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'DURI',
            to: 'MANGGARAI',
            trainNumber: '#1908A',
            estimatedTime: '35 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'duri-manggarai-2',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'DURI',
            to: 'MANGGARAI',
            trainNumber: '#1908B',
            estimatedTime: '35 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'tangerang-duri-1',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'TANGERANG',
            to: 'DURI',
            trainNumber: '#1909A',
            estimatedTime: '20 menit',
            frequency: 'Setiap 12 menit'
        },
        {
            id: 'tangerang-duri-2',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'TANGERANG',
            to: 'DURI',
            trainNumber: '#1909B',
            estimatedTime: '20 menit',
            frequency: 'Setiap 12 menit'
        },
        {
            id: 'tangerang-pesing-1',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'TANGERANG',
            to: 'PESING',
            trainNumber: '#1910A',
            estimatedTime: '25 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'tangerang-pesing-2',
            lineName: 'COMMUTER LINE TANGERANG',
            lineColor: 'bg-amber-600',
            from: 'TANGERANG',
            to: 'PESING',
            trainNumber: '#1910B',
            estimatedTime: '25 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'manggarai-duri-1',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'MANGGARAI',
            to: 'DURI',
            trainNumber: '#1911A',
            estimatedTime: '30 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'manggarai-duri-2',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'MANGGARAI',
            to: 'DURI',
            trainNumber: '#1911B',
            estimatedTime: '30 menit',
            frequency: 'Setiap 15 menit'
        },
        {
            id: 'manggarai-airport-1',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'MANGGARAI',
            to: 'BANDARASOEKARNOHATTA',
            trainNumber: '#1912A',
            estimatedTime: '40 menit',
            frequency: 'Setiap 18 menit'
        },
        {
            id: 'manggarai-airport-2',
            lineName: 'COMMUTER LINE BST',
            lineColor: 'bg-blue-600',
            from: 'MANGGARAI',
            to: 'BANDARASOEKARNOHATTA',
            trainNumber: '#1912B',
            estimatedTime: '40 menit',
            frequency: 'Setiap 18 menit'
        }
    ];

    const handleBackToCommuter = () => {
        setActiveTab(NavigationTab.CommuterLine);
    };

    const handleScheduleOptionSelect = (optionId: string) => {
        setSelectedSchedule(scheduleOptions.find(opt => opt.id === optionId) || scheduleOptions[0]);
    };

    const handleApplySchedule = () => {
        setShowScheduleModal(false);
        setIsScheduleApplied(true);
        if (selectedSchedule.id === 'custom') {
            setSelectedSchedule({
                ...selectedSchedule,
                timeRange: `${customFromTime} - ${customToTime}`
            });
        }
        Swal.fire({
            icon: 'success',
            title: 'Jadwal Diterapkan!',
            text: `Jadwal ${selectedSchedule.label} telah dipilih`,
            confirmButtonText: 'Baik',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleRouteSelect = (route: RouteOption) => {
        console.log('Route selected:', route);
        setSelectedRoute(route);
        setShowScheduleDetail(true);
    };

    const handleBackFromSchedule = () => {
        setShowScheduleDetail(false);
        setSelectedRoute(null);
    };

    if (showScheduleDetail && selectedRoute) {
        return (
            <TrainScheduleScreen 
                setActiveTab={setActiveTab}
                selectedRoute={selectedRoute}
                selectedSchedule={selectedSchedule}
                onBack={handleBackFromSchedule}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {}
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBackToCommuter}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Pesan Tiket Commuter Line</h1>
                    <div className="w-8 h-8" />
                </div>
            </div>

            <div className="p-4 space-y-4">
            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrainIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                Stasiun
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedStation}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowStationModal(true)}
                            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                Jadwal
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedSchedule.timeRange}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Pilih Jadwal Kereta
                    </button>
                </div>

            {}
                {isScheduleApplied && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            Pilih tujuan anda
                        </h2>
                        
                        {getRoutesFromStation(selectedStation).length > 0 ? (
                            getRoutesFromStation(selectedStation).map((route) => (
                                <button
                                    key={route.id}
                                    onClick={() => handleRouteSelect(route)}
                                    className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-left hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
            {}
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${route.lineColor}`}>
                                                    {route.lineName}
                                                </span>
                                            </div>
                                            
            {}
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {route.from}
                                                </span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {route.to}
                                                </span>
                                            </div>
                                            
            {}
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>{route.trainNumber}</span>
                                                <span>{route.estimatedTime}</span>
                                                {route.departureTime && (
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        Berangkat: {route.departureTime}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
            {}
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrainIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    Tidak ada rute tersedia dari stasiun ini
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Coba pilih stasiun lain
                                </p>
                            </div>
                        )}
                    </div>
                )}

            {}
                {!isScheduleApplied && (
                    <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                            Pilih jadwal terlebih dahulu
                        </p>
                        <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                            Setelah jadwal dipilih, daftar rute akan muncul
                        </p>
                    </div>
                )}

            {}
                <div className="mt-6">
                    <button className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                        BELI TIKET KRL DI SINI
                    </button>
                </div>
            </div>

            {}
            {showStationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md p-6 max-h-[70vh] overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Pilih Stasiun
                            </h2>
                            <button
                                onClick={() => setShowStationModal(false)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-96 space-y-2">
                            {availableStations.map((station, index) => (
                                <button
                                    key={`${station.code}-${index}`}
                                    onClick={() => {
                                        setSelectedStation(station.name);
                                        setShowStationModal(false);
                                    }}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                                        selectedStation === station.name
                                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                {station.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {station.city}, {station.province}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {station.code}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Pilih Jadwal Kereta
                            </h2>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {scheduleOptions.map((option) => (
                                <div key={option.id} className="space-y-2">
                                    <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="schedule"
                                            checked={selectedSchedule.id === option.id}
                                            onChange={() => handleScheduleOptionSelect(option.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 dark:text-gray-200">
                                                {option.label}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {option.timeRange}
                                            </p>
                                        </div>
                                    </label>
                                    
            {}
                                    {option.id === 'custom' && selectedSchedule.id === 'custom' && (
                                        <div className="ml-7 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Dari
                                                </label>
                                                <input
                                                    type="time"
                                                    value={customFromTime}
                                                    onChange={(e) => setCustomFromTime(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Sampai
                                                </label>
                                                <input
                                                    type="time"
                                                    value={customToTime}
                                                    onChange={(e) => setCustomToTime(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleApplySchedule}
                            className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            TERAPKAN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainRouteSelectionScreen;
