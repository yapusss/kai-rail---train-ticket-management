import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Station {
    id: string;
    name: string;
    code: string;
    line: string;
    lineColor: string;
    x: number;
    y: number; 
    isInterchange?: boolean;
}

interface SimpleRouteMapProps {
    onStationSelect?: (station: Station) => void;
}
const SimpleRouteMap: React.FC<SimpleRouteMapProps> = ({ onStationSelect }) => {
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    
    const stations: Station[] = [
        { id: '1', name: 'Jakarta Kota', code: 'JAK', line: 'B', lineColor: 'bg-red-500', x: 20, y: 20 },
        { id: '2', name: 'Manggarai', code: 'MGR', line: 'B', lineColor: 'bg-red-500', x: 40, y: 40, isInterchange: true },
        { id: '3', name: 'Tanah Abang', code: 'THB', line: 'R', lineColor: 'bg-green-500', x: 60, y: 60, isInterchange: true },
        { id: '4', name: 'Duri', code: 'DUR', line: 'C', lineColor: 'bg-blue-500', x: 80, y: 80, isInterchange: true },
        { id: '5', name: 'Bekasi', code: 'BKS', line: 'C', lineColor: 'bg-blue-500', x: 15, y: 80 },
        { id: '6', name: 'Tangerang', code: 'TNG', line: 'T', lineColor: 'bg-yellow-500', x: 80, y: 20 },
        { id: '7', name: 'Bandara', code: 'BAND', line: 'A', lineColor: 'bg-sky-400', x: 5, y: 15 },
        { id: '8', name: 'Bogor', code: 'BOG', line: 'B', lineColor: 'bg-red-500', x: 30, y: 95 }
    ];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    setUserLocation({
                        lat: -6.2088,
                        lng: 106.8456
                    });
                }
            );
        } else {
            setUserLocation({
                lat: -6.2088,
                lng: 106.8456
            });
        }
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const calculateTravelTime = (distanceKm: number): number => {
        return Math.round((distanceKm / 30) * 60); 
    };

    const startNavigation = (station: Station) => {
        if (userLocation) {
            const stationCoords = getStationCoordinates(station);
            const distance = calculateDistance(
                userLocation.lat, 
                userLocation.lng,
                stationCoords.lat,
                stationCoords.lng
            );
            
            Swal.fire({
                icon: 'success',
                title: 'Navigasi Dimulai!',
                html: `
                    <div class="text-left">
                        <p><strong><i class="fas fa-map-pin text-blue-500 mr-2"></i>Tujuan:</strong> ${station.name}</p>
                        <p><strong><i class="fas fa-road text-green-500 mr-2"></i>Jarak:</strong> ${distance.toFixed(2)} km</p>
                        <p><strong><i class="fas fa-hourglass-half text-orange-500 mr-2"></i>Estimasi:</strong> ${calculateTravelTime(distance)} menit</p>
                        <p><strong><i class="fas fa-spinner fa-spin text-purple-500 mr-2"></i>Status:</strong> Membuka aplikasi maps...</p>
                    </div>
                `,
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Tidak bisa mendapatkan lokasi Anda'
            });
        }
    };

    const getStationCoordinates = (station: Station) => {
        const minLat = -6.4; 
        const maxLat = -5.9;
        const minLng = 106.6; 
        const maxLng = 107.2; 
        
        const lat = minLat + ((100 - station.y) / 100) * (maxLat - minLat);
        const lng = minLng + (station.x / 100) * (maxLng - minLng);
        
        return { lat, lng };
    };

    const handleStationClick = (station: Station) => {
        setSelectedStation(station);
        
        let distanceInfo = '';
        let travelTimeInfo = '';
        
        if (userLocation) {
            const stationCoords = getStationCoordinates(station);
            const distance = calculateDistance(
                userLocation.lat, 
                userLocation.lng,
                stationCoords.lat,
                stationCoords.lng
            );
            const travelTime = calculateTravelTime(distance);
            
            distanceInfo = `<p><strong><i class="fas fa-map-marker-alt text-blue-500"></i> Jarak dari Anda:</strong> ${distance.toFixed(2)} km</p>`;
            travelTimeInfo = `<p><strong><i class="fas fa-clock text-green-500"></i> Estimasi Waktu:</strong> ${travelTime} menit</p>`;
        } else {
            distanceInfo = '<p><strong><i class="fas fa-map-marker-alt text-gray-500"></i> Jarak:</strong> Aktifkan GPS untuk cek jarak</p>';
        }

        Swal.fire({
            icon: 'info',
            title: `Stasiun ${station.name}`,
            html: `
                <div class="text-left">
                    <p><strong>Kode:</strong> ${station.code}</p>
                    <p><strong>Jalur:</strong> ${station.line}</p>
                    <p><strong>Warna:</strong> <span class="${station.lineColor} text-white px-2 py-1 rounded">Line ${station.line}</span></p>
                    ${station.isInterchange ? '<p class="text-blue-600"><strong><i class="fas fa-exchange-alt mr-1"></i>Stasiun Transit</strong></p>' : ''}
                    ${distanceInfo}
                    ${travelTimeInfo}
                </div>
            `,
            confirmButtonText: 'Baik',
            confirmButtonColor: station.lineColor.includes('red') ? '#EF4444' : 
                               station.lineColor.includes('green') ? '#10B981' : 
                               station.lineColor.includes('blue') ? '#3B82F6' : 
                               station.lineColor.includes('yellow') ? '#F59E0B' : '#0EA5E9',
            showCancelButton: userLocation ? true : false,
            cancelButtonText: '<i class="fas fa-car mr-1"></i> Mulai Rute',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel && userLocation) {
                startNavigation(station);
            }
        });
        
        if (onStationSelect) {
            onStationSelect(station);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-md">
            {}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Peta Rute Komuter</h3>
                        <p className="text-sm text-gray-500">Simple Demo Version</p>
                    </div>
                </div>
                <button
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                >
                    Dapatkan Lokasi
                </button>
            </div>

            {}
            <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ height: '500px' }}>
            {}
                {stations.map((station) => (
                    <div
                        key={station.id}
                        onClick={() => handleStationClick(station)}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${station.x}%`, top: `${station.y}%` }}
                    >
            {}
                        <div className={`w-16 h-16 rounded-full border-4 border-white shadow-2xl text-white flex items-center justify-center font-bold text-sm ${station.lineColor} hover:scale-125 transition-transform duration-200 ${station.isInterchange ? 'animate-bounce' : ''}`}>
                            {station.code.substring(0, 2)}
                        </div>
                        
                        
            {}
                        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                            {station.name}
                        </div>
                    </div>
                ))}

            {}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                    <path d="M 20% 20% L 40% 40% L 60% 60% L 80% 80%" stroke="#EF4444" strokeWidth="3" fill="none" opacity="0.8" />
                    <path d="M 15% 80% L 40% 40%" stroke="#3B82F6" strokeWidth="3" fill="none" opacity="0.8" />
                    <path d="M 80% 20% L 40% 40%" stroke="#F59E0B" strokeWidth="3" fill="none" opacity="0.8" />
                    <path d="M 5% 15% L 40% 40%" stroke="#0EA5E9" strokeWidth="3" fill="none" opacity="0.8" />
                </svg>

            {}
                <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                    <h4 className="text-xs font-semibold mb-2">Jalur</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>B - Bogor</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>R - Rangkasbitung</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>C - Cikarang</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>T - Tangerang</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-sky-400 rounded-full"></div>
                            <span>A - Bandara</span>
                        </div>
                    </div>
                </div>
            </div>

v            <div className="mt-4 bg-green-50 rounded-xl p-3">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">Instruksi:</span>
                </div>
                <ul className="text-sm text-green-600 space-y-1">
                    <li><i className="fas fa-mobile-alt mr-2 text-blue-500"></i><strong>Tap lingkaran berwarna</strong> untuk info stasiun</li>
                    <li><i className="fas fa-circle-notch mr-2 text-red-500"></i><strong>Lingkaran bergetar</strong> = stasiun interchange</li>
                    <li><i className="fas fa-ruler mr-2 text-green-500"></i><strong>Cek jarak & waktu</strong> dalam popup info</li>
                    <li><i className="fas fa-car mr-2 text-orange-500"></i><strong>Tap "Mulai Rute"</strong> untuk navigasi ke stasiun</li>
                </ul>
            </div>

            {}
            {selectedStation && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">{selectedStation.name}</h4>
                        <button
                            onClick={() => setSelectedStation(null)}
                            className="text-gray-500 hover:text-gray-700 text-lg"
                        >
                            ×
                        </button>
                    </div>
                    <div className="space-y-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${selectedStation.lineColor}`}>
                            Line {selectedStation.line}
                        </div>
                        <p className="text-sm text-gray-600">Kode: {selectedStation.code}</p>
                        {selectedStation.isInterchange && (
                            <p className="text-sm text-blue-600 font-medium">🔄 Stasiun Transit</p>
                        )}
                    </div>
                </div>
            )}

            {}
            <div className="mt-4">
                <div className="bg-white rounded-2xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold mb-3 text-center text-gray-800">
                        Peta Resmi Jabodetabek & Merak
                    </h3>
                    <div className="flex justify-center">
                        <img 
                            src="/rute.jpg" 
                            alt="Peta Rute Jabodetabek & Merak"
                            className="max-w-full h-auto rounded-lg shadow-md"
                            style={{ maxHeight: '400px' }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        Sumber: PT Kereta Commuter Indonesia
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SimpleRouteMap;
