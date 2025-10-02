import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { TrainIcon, ArrowLeftIcon, LocationIcon, CalendarIcon, RouteIcon, PriceTagIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';

// Get train services from centralized data
const TRAIN_SERVICES = TrainDataService.getAllTrainServices().map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
    icon: TrainIcon,
    bgColor: service.bgColor,
    trains: service.trains || service.lines || service.systems || service.services || []
}));

// Legacy export for backward compatibility
export { TRAIN_SERVICES };

interface TrainServicesScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const TrainServicesScreen: React.FC<TrainServicesScreenProps> = ({ setActiveTab }) => {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
    };

    const handleBookTicket = (trainName: string, route: string) => {
        alert(`🎫 Booking Tiket ${trainName}\n\nRute: ${route}\n\nFitur booking akan segera tersedia. Silakan hubungi customer service untuk pemesanan.`);
    };

    const handleBackToDashboard = () => {
        setActiveTab(NavigationTab.Dashboard);
    };

    // If a service is selected, show service details
    if (selectedService) {
        const service = TrainDataService.getTrainServiceById(selectedService);
        if (!service) return null;

        // Special layout for Commuter Line
        if (selectedService === 'commuter-line') {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    {/* Header with Pink Gradient */}
                    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setSelectedService(null)}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <ArrowLeftIcon className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold">Commuter Line</h1>
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Main Commuter Line Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <TrainIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Commuter Line</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pesan tiket kereta commuter line anda sekarang menjadi lebih mudah.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleBookTicket('Commuter Line', 'Jabodetabek')}
                                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                PESAN TIKET
                            </button>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Cek Posisi Kereta */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                    <LocationIcon className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Cek Posisi Kereta</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Informasi posisi kereta saat ini.
                                </p>
                            </div>

                            {/* Jadwal Kereta */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                    <CalendarIcon className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Jadwal Kereta</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Informasi jadwal perjalanan KRL.
                                </p>
                            </div>

                            {/* Rute dan Jalur */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                    <RouteIcon className="w-6 h-6 text-purple-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Rute dan Jalur</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Informasi Rute dan Jalur KRL.
                                </p>
                            </div>

                            {/* Cek Tarif */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                                    <PriceTagIcon className="w-6 h-6 text-orange-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Cek Tarif</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Informasi tarif perjalanan KRL.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Default layout for other services
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={handleBackToDashboard}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">{service.name}</h1>
                        <div></div>
                    </div>
                    <p className="text-sm opacity-90 mt-2">{service.description}</p>
                </div>

                {/* Service Details */}
                <div className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pilih Layanan</h2>
                    <div className="space-y-3">
                        {(service.trains || service.lines || service.systems || service.services || []).map((item: any, index: number) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.route?.from?.city && item.route?.to?.city 
                                                ? `${item.route.from.city} - ${item.route.to.city}`
                                                : item.route || 'N/A'
                                            }
                                        </p>
                                        {item.code && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">{item.code}</p>
                                        )}
                                    </div>
                                    <div className={`p-3 ${service.bgColor} rounded-full`}>
                                        <TrainIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.duration}</p>
                                        </div>
                                        {item.distance && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Jarak</p>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.distance}</p>
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Harga</p>
                                            <p className="font-semibold text-green-600 dark:text-green-400">
                                                {item.classes?.[0]?.price 
                                                    ? TrainDataService.formatPrice(item.classes[0].price)
                                                    : item.price 
                                                        ? TrainDataService.formatPrice(item.price)
                                                        : 'N/A'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {item.classes && item.classes.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kelas tersedia:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.classes.map((trainClass: any, classIndex: number) => (
                                                <span key={classIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {trainClass.name} - {TrainDataService.formatPrice(trainClass.price)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={() => handleBookTicket(
                                        item.name, 
                                        item.route?.from?.city && item.route?.to?.city 
                                            ? `${item.route.from.city} - ${item.route.to.city}`
                                            : item.route || 'N/A'
                                    )}
                                    className={`w-full py-3 ${service.bgColor} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                                >
                                    Pesan Tiket
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Main service selection screen
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleBackToDashboard}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Layanan Kereta</h1>
                    <div></div>
                </div>
                <p className="text-sm opacity-90 mt-2">Pilih jenis layanan kereta yang Anda butuhkan</p>
            </div>

            {/* Service Grid */}
            <div className="p-4 space-y-4">
                {TRAIN_SERVICES.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center`}>
                                <TrainIcon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{service.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {(service.trains || []).length} layanan tersedia
                                </p>
                            </div>
                            <div className="text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainServicesScreen;