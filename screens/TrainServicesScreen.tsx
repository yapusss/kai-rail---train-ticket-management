import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { TrainIcon, ArrowLeftIcon } from '../components/icons/FeatureIcons';

// Train service types with variations
const TRAIN_SERVICES = [
    {
        id: 'intercity',
        name: 'Inter City',
        description: 'Kereta antarkota untuk perjalanan jarak jauh',
        icon: TrainIcon,
        bgColor: 'bg-blue-500',
        variations: [
            { name: 'Argo Bromo Anggrek', route: 'Jakarta - Surabaya', duration: '8h 30m', price: 'Rp 600.000' },
            { name: 'Taksaka', route: 'Jakarta - Yogyakarta', duration: '7h 30m', price: 'Rp 550.000' },
            { name: 'Argo Lawu', route: 'Jakarta - Solo', duration: '6h 45m', price: 'Rp 500.000' },
            { name: 'Sancaka', route: 'Jakarta - Yogyakarta', duration: '8h 15m', price: 'Rp 450.000' }
        ]
    },
    {
        id: 'local',
        name: 'Local',
        description: 'Kereta lokal untuk perjalanan jarak menengah',
        icon: TrainIcon,
        bgColor: 'bg-orange-500',
        variations: [
            { name: 'Jayabaya', route: 'Jakarta - Malang', duration: '13h 5m', price: 'Rp 450.000' },
            { name: 'Serayu', route: 'Jakarta - Purwokerto', duration: '6h 15m', price: 'Rp 70.000' },
            { name: 'Kutojaya', route: 'Jakarta - Kutoarjo', duration: '7h 30m', price: 'Rp 85.000' },
            { name: 'Progo', route: 'Jakarta - Yogyakarta', duration: '8h 45m', price: 'Rp 95.000' }
        ]
    },
    {
        id: 'commuter',
        name: 'Commuter Line',
        description: 'Kereta komuter untuk perjalanan harian',
        icon: TrainIcon,
        bgColor: 'bg-red-500',
        variations: [
            { name: 'Bogor Line', route: 'Jakarta - Bogor', duration: '1h 15m', price: 'Rp 4.000' },
            { name: 'Depok Line', route: 'Jakarta - Depok', duration: '45m', price: 'Rp 3.000' },
            { name: 'Tangerang Line', route: 'Jakarta - Tangerang', duration: '1h 30m', price: 'Rp 5.000' },
            { name: 'Bekasi Line', route: 'Jakarta - Bekasi', duration: '1h 10m', price: 'Rp 4.500' }
        ]
    },
    {
        id: 'lrt',
        name: 'LRT',
        description: 'Light Rail Transit untuk perjalanan dalam kota',
        icon: TrainIcon,
        bgColor: 'bg-purple-500',
        variations: [
            { name: 'LRT Jakarta', route: 'Kelapa Gading - Velodrome', duration: '35m', price: 'Rp 5.000' },
            { name: 'LRT Palembang', route: 'Bandara - Jakabaring', duration: '45m', price: 'Rp 3.000' },
            { name: 'LRT Jabodebek', route: 'Cawang - Bekasi', duration: '1h 20m', price: 'Rp 8.000' }
        ]
    },
    {
        id: 'airport',
        name: 'Airport Train',
        description: 'Kereta bandara untuk akses ke/dari bandara',
        icon: TrainIcon,
        bgColor: 'bg-blue-400',
        variations: [
            { name: 'Soekarno-Hatta Express', route: 'Manggarai - Bandara', duration: '55m', price: 'Rp 40.000' },
            { name: 'Skytrain', route: 'Terminal 1 - Terminal 3', duration: '5m', price: 'Free' },
            { name: 'Kualanamu Express', route: 'Medan - Bandara', duration: '45m', price: 'Rp 100.000' }
        ]
    }
];

interface TrainServicesScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const TrainServicesScreen: React.FC<TrainServicesScreenProps> = ({ setActiveTab }) => {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const handleBackToDashboard = () => {
        setActiveTab(NavigationTab.Dashboard);
    };

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
    };

    const handleBookTicket = (serviceName: string, route: string) => {
        alert(`🎫 Booking Tiket ${serviceName}\n\nRute: ${route}\n\nAnda akan dialihkan ke halaman pemesanan.`);
        // Navigate to planner for booking
        setActiveTab(NavigationTab.Planner);
    };

    if (selectedService) {
        const service = TRAIN_SERVICES.find(s => s.id === selectedService);
        if (!service) return null;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => setSelectedService(null)}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">{service.name}</h1>
                        <div></div>
                    </div>
                    <p className="text-sm opacity-90 mt-2">{service.description}</p>
                </div>

                {/* Service Variations */}
                <div className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pilih Rute</h2>
                    <div className="space-y-3">
                        {service.variations.map((variation, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{variation.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{variation.route}</p>
                                    </div>
                                    <div className={`p-3 ${service.bgColor} rounded-full`}>
                                        <TrainIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{variation.duration}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Harga</p>
                                            <p className="font-semibold text-green-600 dark:text-green-400">{variation.price}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleBookTicket(variation.name, variation.route)}
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
                <p className="text-sm opacity-90 mt-2">Pilih jenis layanan kereta yang Anda inginkan</p>
            </div>

            {/* Service List */}
            <div className="p-4 space-y-4">
                {TRAIN_SERVICES.map((service) => (
                    <div 
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`p-4 ${service.bgColor} rounded-full`}>
                                    <service.icon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        {service.variations.length} pilihan rute
                                    </p>
                                </div>
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
