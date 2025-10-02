import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { TrainIcon, ArrowLeftIcon } from '../components/icons/FeatureIcons';

// Train service types with variations
export const TRAIN_SERVICES = [
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
            { name: 'Sancaka', route: 'Jakarta - Yogyakarta', duration: '8h 15m', price: 'Rp 450.000' },
            { name: 'Argo Sindoro', route: 'Jakarta - Semarang', duration: '6h 15m', price: 'Rp 480.000' },
            { name: 'Argo Wilis', route: 'Jakarta - Surabaya', duration: '9h 20m', price: 'Rp 580.000' },
            { name: 'Argo Dwipangga', route: 'Jakarta - Solo', duration: '7h 10m', price: 'Rp 520.000' },
            { name: 'Argo Muria', route: 'Jakarta - Semarang', duration: '6h 45m', price: 'Rp 490.000' },
            { name: 'Argo Parahyangan', route: 'Jakarta - Bandung', duration: '3h 15m', price: 'Rp 180.000' },
            { name: 'Argo Cheribon', route: 'Jakarta - Cirebon', duration: '4h 30m', price: 'Rp 220.000' },
            { name: 'Turangga', route: 'Jakarta - Bandung', duration: '3h 45m', price: 'Rp 160.000' },
            { name: 'Gumarang', route: 'Jakarta - Surabaya', duration: '8h 45m', price: 'Rp 620.000' },
            { name: 'Sembrani', route: 'Jakarta - Surabaya', duration: '9h 10m', price: 'Rp 650.000' },
            { name: 'Bima', route: 'Jakarta - Yogyakarta', duration: '8h 30m', price: 'Rp 540.000' },
            { name: 'Fajar Utama', route: 'Jakarta - Yogyakarta', duration: '7h 45m', price: 'Rp 530.000' },
            { name: 'Senja Utama', route: 'Jakarta - Yogyakarta', duration: '8h 15m', price: 'Rp 530.000' },
            { name: 'Fajar/Senja Utama', route: 'Jakarta - Solo', duration: '7h 30m', price: 'Rp 510.000' },
            { name: 'Gajayana', route: 'Jakarta - Malang', duration: '12h 30m', price: 'Rp 680.000' },
            { name: 'Brawijaya', route: 'Jakarta - Malang', duration: '13h 15m', price: 'Rp 620.000' },
            { name: 'Malabar', route: 'Bandung - Malang', duration: '9h 45m', price: 'Rp 480.000' }
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
            { name: 'Progo', route: 'Jakarta - Yogyakarta', duration: '8h 45m', price: 'Rp 95.000' },
            { name: 'Kertajaya', route: 'Jakarta - Surabaya', duration: '12h 30m', price: 'Rp 180.000' },
            { name: 'Mutiara Selatan', route: 'Jakarta - Bandung', duration: '4h 15m', price: 'Rp 45.000' },
            { name: 'Kahuripan', route: 'Jakarta - Surabaya', duration: '13h 45m', price: 'Rp 190.000' },
            { name: 'Pasundan', route: 'Jakarta - Bandung', duration: '4h 30m', price: 'Rp 50.000' },
            { name: 'Bengawan', route: 'Jakarta - Solo', duration: '9h 30m', price: 'Rp 120.000' },
            { name: 'Gaya Baru Malam Selatan', route: 'Jakarta - Surabaya', duration: '14h 20m', price: 'Rp 200.000' },
            { name: 'Bogowonto', route: 'Jakarta - Yogyakarta', duration: '9h 15m', price: 'Rp 110.000' },
            { name: 'Gajah Wong', route: 'Jakarta - Yogyakarta', duration: '8h 45m', price: 'Rp 100.000' },
            { name: 'Senja Utama', route: 'Jakarta - Solo', duration: '8h 30m', price: 'Rp 115.000' },
            { name: 'Fajar Utama', route: 'Jakarta - Solo', duration: '8h 15m', price: 'Rp 115.000' },
            { name: 'Tawang Jaya', route: 'Jakarta - Semarang', duration: '7h 45m', price: 'Rp 90.000' },
            { name: 'Kaligung', route: 'Jakarta - Tegal', duration: '5h 30m', price: 'Rp 65.000' },
            { name: 'Joglosemarkerto', route: 'Jakarta - Yogyakarta', duration: '9h 00m', price: 'Rp 105.000' },
            { name: 'Sri Tanjung', route: 'Jakarta - Surabaya', duration: '13h 30m', price: 'Rp 195.000' },
            { name: 'Blambangan Ekspres', route: 'Jakarta - Banyuwangi', duration: '16h 45m', price: 'Rp 280.000' },
            { name: 'Mutiara Timur', route: 'Jakarta - Surabaya', duration: '12h 45m', price: 'Rp 185.000' }
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
            { name: 'Bekasi Line', route: 'Jakarta - Bekasi', duration: '1h 10m', price: 'Rp 4.500' },
            { name: 'Serpong Line', route: 'Jakarta - Serpong', duration: '1h 20m', price: 'Rp 4.500' },
            { name: 'Cikarang Line', route: 'Jakarta - Cikarang', duration: '1h 35m', price: 'Rp 5.500' },
            { name: 'Rangkasbitung Line', route: 'Jakarta - Rangkasbitung', duration: '2h 15m', price: 'Rp 8.000' },
            { name: 'Tanjung Priok Line', route: 'Jakarta - Tanjung Priok', duration: '35m', price: 'Rp 3.500' },
            { name: 'Maja Line', route: 'Jakarta - Maja', duration: '1h 45m', price: 'Rp 6.000' },
            { name: 'Parung Panjang Line', route: 'Jakarta - Parung Panjang', duration: '1h 25m', price: 'Rp 4.800' },
            { name: 'Nambo Line', route: 'Jakarta - Nambo', duration: '1h 40m', price: 'Rp 5.800' },
            { name: 'KRL Jabodetabek', route: 'Jakarta - Depok', duration: '50m', price: 'Rp 3.200' },
            { name: 'KRL Cikarang', route: 'Jakarta - Cikarang', duration: '1h 30m', price: 'Rp 5.200' },
            { name: 'KRL Bekasi', route: 'Jakarta - Bekasi', duration: '1h 05m', price: 'Rp 4.300' },
            { name: 'KRL Bogor', route: 'Jakarta - Bogor', duration: '1h 10m', price: 'Rp 4.100' },
            { name: 'KRL Tangerang', route: 'Jakarta - Tangerang', duration: '1h 25m', price: 'Rp 4.900' },
            { name: 'KRL Serpong', route: 'Jakarta - Serpong', duration: '1h 15m', price: 'Rp 4.400' },
            { name: 'KRL Rangkasbitung', route: 'Jakarta - Rangkasbitung', duration: '2h 10m', price: 'Rp 7.800' },
            { name: 'KRL Tanjung Priok', route: 'Jakarta - Tanjung Priok', duration: '30m', price: 'Rp 3.300' },
            { name: 'KRL Maja', route: 'Jakarta - Maja', duration: '1h 40m', price: 'Rp 5.900' }
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
            { name: 'LRT Jabodebek', route: 'Cawang - Bekasi', duration: '1h 20m', price: 'Rp 8.000' },
            { name: 'LRT Jakarta Utara', route: 'Kelapa Gading - Tanjung Priok', duration: '25m', price: 'Rp 4.000' },
            { name: 'LRT Jakarta Selatan', route: 'Velodrome - Ragunan', duration: '30m', price: 'Rp 4.500' },
            { name: 'LRT Jakarta Timur', route: 'Cawang - Halim', duration: '20m', price: 'Rp 3.500' },
            { name: 'LRT Jakarta Barat', route: 'Cawang - Grogol', duration: '35m', price: 'Rp 5.500' },
            { name: 'LRT Jakarta Pusat', route: 'Cawang - Senayan', duration: '40m', price: 'Rp 6.000' },
            { name: 'LRT Palembang Utara', route: 'Bandara - Ampera', duration: '35m', price: 'Rp 2.500' },
            { name: 'LRT Palembang Selatan', route: 'Jakabaring - Plaju', duration: '50m', price: 'Rp 3.500' },
            { name: 'LRT Jabodebek Cibubur', route: 'Cawang - Cibubur', duration: '45m', price: 'Rp 6.500' },
            { name: 'LRT Jabodebek Bekasi', route: 'Cawang - Bekasi', duration: '55m', price: 'Rp 7.500' },
            { name: 'LRT Jabodebek Depok', route: 'Cawang - Depok', duration: '1h 05m', price: 'Rp 7.000' },
            { name: 'LRT Jabodebek Bogor', route: 'Cawang - Bogor', duration: '1h 15m', price: 'Rp 8.500' },
            { name: 'LRT Jabodebek Tangerang', route: 'Cawang - Tangerang', duration: '1h 25m', price: 'Rp 9.000' },
            { name: 'LRT Jakarta Express', route: 'Kelapa Gading - Bandara', duration: '50m', price: 'Rp 12.000' },
            { name: 'LRT Palembang Express', route: 'Bandara - Jakabaring', duration: '40m', price: 'Rp 5.000' },
            { name: 'LRT Jabodebek Express', route: 'Cawang - Bandara', duration: '1h 30m', price: 'Rp 15.000' },
            { name: 'LRT Jakarta Commuter', route: 'Kelapa Gading - Manggarai', duration: '30m', price: 'Rp 4.000' },
            { name: 'LRT Palembang Commuter', route: 'Bandara - Kertapati', duration: '25m', price: 'Rp 2.500' }
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
            { name: 'Kualanamu Express', route: 'Medan - Bandara', duration: '45m', price: 'Rp 100.000' },
            { name: 'Soekarno-Hatta Express Premium', route: 'Manggarai - Bandara', duration: '45m', price: 'Rp 60.000' },
            { name: 'Skytrain Terminal 2', route: 'Terminal 2 - Terminal 3', duration: '3m', price: 'Free' },
            { name: 'Kualanamu Express Business', route: 'Medan - Bandara', duration: '40m', price: 'Rp 150.000' },
            { name: 'Soekarno-Hatta Express Business', route: 'Manggarai - Bandara', duration: '50m', price: 'Rp 80.000' },
            { name: 'Skytrain All Terminals', route: 'Terminal 1 - Terminal 2 - Terminal 3', duration: '8m', price: 'Free' },
            { name: 'Kualanamu Express Economy', route: 'Medan - Bandara', duration: '50m', price: 'Rp 80.000' },
            { name: 'Soekarno-Hatta Express Economy', route: 'Manggarai - Bandara', duration: '60m', price: 'Rp 30.000' },
            { name: 'Skytrain Express', route: 'Terminal 1 - Terminal 3', duration: '4m', price: 'Free' },
            { name: 'Kualanamu Express VIP', route: 'Medan - Bandara', duration: '35m', price: 'Rp 200.000' },
            { name: 'Soekarno-Hatta Express VIP', route: 'Manggarai - Bandara', duration: '40m', price: 'Rp 100.000' },
            { name: 'Skytrain Shuttle', route: 'Terminal 2 - Terminal 1', duration: '2m', price: 'Free' },
            { name: 'Kualanamu Express Shuttle', route: 'Medan - Bandara', duration: '55m', price: 'Rp 70.000' },
            { name: 'Soekarno-Hatta Express Shuttle', route: 'Manggarai - Bandara', duration: '65m', price: 'Rp 25.000' },
            { name: 'Skytrain Night Service', route: 'Terminal 1 - Terminal 3', duration: '5m', price: 'Free' },
            { name: 'Kualanamu Express Night', route: 'Medan - Bandara', duration: '45m', price: 'Rp 120.000' },
            { name: 'Soekarno-Hatta Express Night', route: 'Manggarai - Bandara', duration: '55m', price: 'Rp 50.000' },
            { name: 'Skytrain 24/7', route: 'All Terminals', duration: '6m', price: 'Free' }
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
        alert(`🎫 Booking Tiket ${serviceName}\n\nRute: ${route}\n\nFitur booking akan segera tersedia. Silakan hubungi customer service untuk pemesanan.`);
        // Booking functionality will be implemented later
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
