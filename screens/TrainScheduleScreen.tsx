import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ArrowLeftIcon, TrainIcon, CalendarIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import Swal from 'sweetalert2';

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

interface ScheduleOption {
    id: string;
    label: string;
    timeRange: string;
    selected: boolean;
}

interface TrainScheduleScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
    selectedRoute?: RouteOption;
    selectedSchedule?: ScheduleOption;
    onBack?: () => void;
}

interface StationStop {
    name: string;
    code: string;
    time: string;
    isCurrent: boolean;
    isTransit?: boolean;
    connectingLines?: string[];
}

const TrainScheduleScreen: React.FC<TrainScheduleScreenProps> = ({ 
    setActiveTab, 
    selectedRoute, 
    selectedSchedule,
    onBack
}) => {
    const defaultRoute = {
        id: 'default',
        lineName: 'COMMUTER LINE TANGERANG',
        lineColor: 'bg-amber-600',
        from: 'PESING',
        to: 'DURI',
        trainNumber: '#1903A',
        estimatedTime: '15 menit',
        frequency: 'Setiap 10 menit',
        departureTime: '17:24'
    };
    
    const defaultSchedule = {
        id: '1hour',
        label: '1 Jam Kedepan',
        timeRange: '17:24 - 18:24',
        selected: true
    };
    
    const currentRoute = selectedRoute || defaultRoute;
    const currentSchedule = selectedSchedule || defaultSchedule;
    
    const [customFromTime, setCustomFromTime] = useState('12:00');
    const [customToTime, setCustomToTime] = useState('13:00');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [localSelectedSchedule, setLocalSelectedSchedule] = useState(currentSchedule);
    
    console.log('TrainScheduleScreen received:', { selectedRoute, selectedSchedule, currentRoute, currentSchedule });

    const scheduleOptions: ScheduleOption[] = [
        {
            id: '1hour',
            label: '1 Jam Kedepan',
            timeRange: '17:24 - 18:24',
            selected: localSelectedSchedule.id === '1hour'
        },
        {
            id: 'today',
            label: '1 Hari ini',
            timeRange: '00:00 - 23:59',
            selected: localSelectedSchedule.id === 'today'
        },
        {
            id: 'custom',
            label: 'Atur Jadwal Sendiri',
            timeRange: `${customFromTime} - ${customToTime}`,
            selected: localSelectedSchedule.id === 'custom'
        }
    ];

    const generateStationStops = (route: any): StationStop[] => {
        const departureTime = route.departureTime || '17:24';
        const [depHour, depMinute] = departureTime.split(':').map(Number);
        
        if (route.from === 'PESING' && route.to === 'DURI') {
            return [
                { name: 'Rawa buaya', code: 'RWB', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute - 6).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Bojong indah', code: 'BJI', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute - 4).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Taman kota', code: 'TMK', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute - 2).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Pesing', code: 'PSG', time: `${depHour.toString().padStart(2, '0')}.${depMinute.toString().padStart(2, '0')}`, isCurrent: true },
                { name: 'Grogol', code: 'GGL', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 2).toString().padStart(2, '0')}`, isCurrent: false },
                { 
                    name: 'Duri', 
                    code: 'DUR', 
                    time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 5).toString().padStart(2, '0')}`, 
                    isCurrent: false, 
                    isTransit: true,
                    connectingLines: ['orange', 'blue']
                }
            ];
        } else if (route.from === 'PESING' && route.to === 'TANGERANG') {
            return [
                { name: 'Pesing', code: 'PSG', time: `${depHour.toString().padStart(2, '0')}.${depMinute.toString().padStart(2, '0')}`, isCurrent: true },
                { name: 'Grogol', code: 'GGL', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 2).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Duri', code: 'DUR', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 5).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Kota', code: 'KTA', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 17).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Tangerang', code: 'TNG', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 25).toString().padStart(2, '0')}`, isCurrent: false }
            ];
        } else if (route.from === 'PESING' && route.to === 'BANDARASOEKARNOHATTA') {
            return [
                { name: 'Pesing', code: 'PSG', time: `${depHour.toString().padStart(2, '0')}.${depMinute.toString().padStart(2, '0')}`, isCurrent: true },
                { name: 'Duri', code: 'DUR', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 5).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Manggarai', code: 'MGR', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 15).toString().padStart(2, '0')}`, isCurrent: false },
                { name: 'Bandarasoekarnohatta', code: 'BTH', time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 35).toString().padStart(2, '0')}`, isCurrent: false }
            ];
        } else {
            return [
                { name: route.from, code: route.from.substring(0,3), time: `${depHour.toString().padStart(2, '0')}.${depMinute.toString().padStart(2, '0')}`, isCurrent: true },
                { name: route.to, code: route.to.substring(0,3), time: `${(depHour).toString().padStart(2, '0')}.${(depMinute + 5).toString().padStart(2, '0')}`, isCurrent: false }
            ];
        }
    };
    
    const stationStops = generateStationStops(currentRoute);

    const handleBackToCommuter = () => {
        if (onBack) {
            onBack();
        } else {
            setActiveTab(NavigationTab.CommuterLine);
        }
    };

    const handleScheduleOptionSelect = (optionId: string) => {
        const selectedOption = scheduleOptions.find(opt => opt.id === optionId) || scheduleOptions[0];
        setLocalSelectedSchedule(selectedOption);
    };

    const handleApplySchedule = () => {
        setShowScheduleModal(false);
        setLocalSelectedSchedule(localSelectedSchedule);
    };

    const handleViewRoute = () => {
        Swal.fire({
            icon: 'info',
            title: 'Lihat Jalur',
            text: 'Fitur ini akan membuka peta rute kereta',
            confirmButtonText: 'Baik'
        });
    };

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
                    <div className="text-center">
                        <h1 className="text-xl font-bold">{currentRoute.from} → {currentRoute.to}</h1>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${currentRoute.lineColor || 'bg-amber-600'}`}>
                                {currentRoute.lineName}
                            </span>
                            <span className="text-sm font-medium">#{currentRoute.trainNumber}</span>
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                    <div className="w-8 h-8" />
                </div>
            </div>

            {}
            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            {}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrainIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                                    Rute Perjalanan
                                </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentRoute.from} → {currentRoute.to}
                            </p>
                            </div>
                        </div>
                    </div>

            {}
                    <div className="relative">
            {}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200 border-l-2 border-dashed"></div>
                        
                        {stationStops.map((stop, index) => (
                            <div key={stop.code} className="relative flex items-center py-3">
            {}
                                <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                                    stop.isCurrent ? 'bg-blue-500' : 'bg-blue-300'
                                }`}></div>
                                
            {}
                                <div className="ml-4 flex-1 flex items-center justify-between">
                                    <div className="flex-1">
                                        {stop.isCurrent && (
                                            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-2 mb-2">
                                                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                    Anda berada disini
                                                </p>
                                            </div>
                                        )}
                                        <p className={`font-semibold ${
                                            stop.isCurrent 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-800 dark:text-gray-200'
                                        }`}>
                                            {stop.name}
                                        </p>
                                        {stop.isTransit && (
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Transit
                                                </span>
                                                {stop.connectingLines && (
                                                    <div className="flex space-x-1">
                                                        {stop.connectingLines.map((color, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`w-3 h-3 rounded-full ${
                                                                    color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                                                                }`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                            {stop.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            {}
                

            {}
                <div className="mt-4">
                    <button
                        onClick={handleViewRoute}
                        className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center space-x-3"
                    >
                        <TrainIcon className="w-6 h-6" />
                        <span>Lihat Jalur</span>
                    </button>
                </div>
            </div>

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
                                            checked={localSelectedSchedule.id === option.id}
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
                                    {option.id === 'custom' && localSelectedSchedule.id === 'custom' && (
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

export default TrainScheduleScreen;
