import React from 'react';
import { NavigationTab } from '../types';
import { ArrowLeftIcon } from '../components/icons/FeatureIcons';

interface NotificationsScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const mockNotifications = [
    
    {
        id: 1,
        title: "Pembayaran Berhasil",
        message: "Tiket Argo Bromo Anggrek untuk 15 Desember telah berhasil dibayar",
        time: "2 menit yang lalu",
        type: "success"
    },
    {
        id: 2,
        title: "Reminder Perjalanan",
        message: "Jangan lupa untuk check-in tiket Anda 2 jam sebelum keberangkatan",
        time: "1 jam yang lalu",
        type: "info"
    },
    {
        id: 3,
        title: "Promo Spesial",
        message: "Dapatkan diskon 20% untuk perjalanan Jakarta-Surabaya bulan ini",
        time: "3 jam yang lalu",
        type: "promo"
    },
    {
        id: 4,
        title: "Update Jadwal",
        message: "Jadwal kereta Argo Wilis mengalami perubahan waktu keberangkatan",
        time: "5 jam yang lalu",
        type: "warning"
    },
    {
        id: 5,
        title: "Tiket Tersedia",
        message: "Tiket kereta Jakarta-Bandung untuk tanggal 20 Desember sudah tersedia",
        time: "1 hari yang lalu",
        type: "info"
    },
    {
        id: 6,
        title: "Promo Weekend",
        message: "Dapatkan cashback 15% untuk semua pembelian tiket weekend",
        time: "2 hari yang lalu",
        type: "promo"
    }
];

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ setActiveTab }) => {
    const handleBackToDashboard = () => {
        setActiveTab(NavigationTab.Dashboard);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBackToDashboard}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Notifikasi</h1>
                    <div className="w-10 h-10" />
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Semua Notifikasi ({mockNotifications.length})
                    </h2>
                    <button className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Tandai Semua Dibaca
                    </button>
                </div>

                <div className="space-y-3">
                    {mockNotifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-l-blue-500"
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                    notification.type === 'success' ? 'bg-green-500' :
                                    notification.type === 'warning' ? 'bg-yellow-500' :
                                    notification.type === 'promo' ? 'bg-purple-500' :
                                    'bg-blue-500'
                                }`}></div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                                {notification.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-gray-400 dark:text-gray-500 text-xs">
                                                {notification.time}
                                            </p>
                                        </div>
                                        <div className="ml-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                notification.type === 'promo' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}>
                                                {notification.type === 'success' ? 'Berhasil' :
                                                 notification.type === 'warning' ? 'Peringatan' :
                                                 notification.type === 'promo' ? 'Promo' :
                                                 'Info'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationsScreen;
